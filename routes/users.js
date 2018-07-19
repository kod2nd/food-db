const express = require('express')
const usersRouter = express.Router()
const User = require('../models/user')
const FoodLocation = require('../models/location')
const jwt = require('jsonwebtoken')
const { passport, jwtOptions } = require('../config/passport')
const mongoose = require('mongoose')
const checkIfAdmin = require('../middlewares/checkIfAdmin')
const checkIfUserOrAdmin = require('../middlewares/checkIfUserOrAdmin')

usersRouter.use(express.json())

usersRouter.post("/signup", async (req, res, next) => {
    const { username, password, name, age, admin } = req.body;
    if (!password) {
        const noPasswordError = "Please enter a password!"
        next(noPasswordError)
    }
    const user = new User({
        username,
        name: name,
        age: age,
        admin: admin
    });
    user.setHashedPassword(password);
    try {
        await user.save();
        res.status(201).json({ message: "Success! User Created", user });
    } catch (err) {
        next(err);
    }
});
usersRouter.post("/signin", async (req, res) => {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user) {
        res.status(401).json({ message: "no such user found" });
    }

    if (user.validatePassword(password)) {
        const userId = { id: user.id };
        const token = jwt.sign(userId, jwtOptions.secretOrKey);
        res.json({ message: "ok", token: token });
    } else {
        res.status(401).json({ message: "passwords did not match" });
    }
});

usersRouter.get('/', passport.authenticate('jwt', { session: false }), checkIfAdmin, async (req, res, next) => {
    try {
        const users = await User.find().populate('locations')
        res.json(users)
    } catch (error) {
        next()
    }
})

usersRouter.get('/:id', passport.authenticate('jwt', { session: false }), checkIfUserOrAdmin, async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).populate('locations')
        res.json(user)
    } catch (error) {
        next()
    }
})

usersRouter.put('/:id', passport.authenticate('jwt', { session: false }), checkIfUserOrAdmin, async (req, res, next) => {
    try {
        const toUpdate = User.findByIdAndUpdate(req.params.id, req.body)
        const selectedUser = await User.findById(req.params.id)
        await toUpdate.exec(error => {
            if (error) {
                next()
            }
            res.json({
                message: "Successfully updated user!",
            })
        })
    } catch (error) {
        next()
    }
})

usersRouter.delete('/:id', passport.authenticate('jwt', { session: false }), checkIfUserOrAdmin, async (req, res, next) => {
    const toDelete = User.findByIdAndDelete(req.params.id)
    await toDelete.exec(error => {
        if (error) {
            next()
        }
        res.json({ message: "Successful Delete" })
    })
})

usersRouter.post('/:id/locations', passport.authenticate('jwt', { session: false }), checkIfUserOrAdmin, async (req, res, next) => {
    try {
        let locationIdToSaveIntoUsers
        const inputLat = req.body.lat
        const inputLng = req.body.lng
        const requestedLocation = await FoodLocation.findOne({ lat: inputLat, lng: inputLng })
        const user = await User.findById(req.params.id)
        const userId = user._id
        let userLocations = user.locations

        // If the posted location already exists in the database, do not create a new location in the database.
        if (!requestedLocation) {
            const newFoodLocation = new FoodLocation({
                name: req.body.name,
                address: req.body.address,
                lat: req.body.lat,
                lng: req.body.lng,
                rating: req.body.rating
            })
            locationIdToSaveIntoUsers = (await newFoodLocation.save())._id

        } else {
            locationIdToSaveIntoUsers = requestedLocation._id;
        }

        // To check if the user already has the location saved in his account otherwise add to locations list
        if (user.locations.indexOf(locationIdToSaveIntoUsers) === -1) {
            userLocations = [...userLocations, locationIdToSaveIntoUsers]
            await User.findByIdAndUpdate(userId, { locations: userLocations })
            res.json({ message: "Your location has been added!" })
        } else { res.status(400).json({ message: "You already have that location saved!" }) }
    } catch (error) {
        next(error)
    }
})

usersRouter.get('/:id/locations', passport.authenticate('jwt', { session: false }), async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).populate('locations')
        res.json(user.locations)
    } catch (error) {
        next(error)
    }
})

usersRouter.delete('/:id/locations/:locationid', passport.authenticate('jwt', { session: false }), checkIfUserOrAdmin, async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id)
        let userLocations = user.locations
        const locationIdPosition = userLocations.indexOf(req.params.locationid)
        if (locationIdPosition > -1) {
            userLocations.splice(locationIdPosition, 1)
            await User.findByIdAndUpdate(req.params.id, { locations: userLocations })
            res.json({ message: "Removed location successfully!" })
        } else {
            res.status(400).json({ Error: "locationid not found!" })
        }
    } catch (error) {
        next(error)
    }

})

module.exports = (app) => {
    app.use('/users', usersRouter)
}