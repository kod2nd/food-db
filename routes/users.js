const express = require('express')
const usersRouter = express.Router()
const User = require('../models/user')
const FoodLocation = require('../models/location')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const { passport, jwtOptions } = require('../config/passport')

usersRouter.use(bodyParser())

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

usersRouter.get('/', async (req, res, next) => {
    try {
        const users = await User.find()
        res.json(users)
    } catch (error) {
        next()
    }
})

usersRouter.get('/:id', async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id)
        res.json(user)
    } catch (error) {
        next()
    }
})

usersRouter.put('/:id', async (req, res, next) => {
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

usersRouter.delete('/:id', async (req, res, next) => {
    const toDelete = User.findByIdAndDelete(req.params.id)
    await toDelete.exec(error => {
        if (error) {
            next()
        }
        res.json({ message: "Successful Delete" })
    })
})

usersRouter.post('/:username/locations', async (req, res, next) => {
    const specificUser = await User.findOne({username: req.params.username})
    // console.log(specificUser)
    const updatedLocations = [...specificUser.locations, {name: "You have been updated"}]
    const updatedUser = await User.findByIdAndUpdate(specificUser._id, updatedLocations)
    console.log(updatedUser)
    res.json(updatedUser)
})

module.exports = (app) => {
    app.use('/users', usersRouter)
}