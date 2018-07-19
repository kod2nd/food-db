const express = require('express')
const locationsRouter = express.Router()
const FoodLocation = require('../models/location')
const { passport } = require('../config/passport')
const checkIfAdmin = require('../middlewares/checkIfAdmin')
locationsRouter.use(express.json())


locationsRouter.post('/', passport.authenticate('jwt', { session: false }), checkIfAdmin, async (req, res, next) => {
    try {
        const newFoodLocation = new FoodLocation({
            name: req.body.name,
            address: req.body.address,
            lat: req.body.lat,
            lng: req.body.lng,
            rating: req.body.rating
        })
        await newFoodLocation.save()
        res.status(201).json({ message: "Updated food location " + req.body.name })
    } catch (error) {
        next(error)
    }
})

locationsRouter.get('/', async (req, res, next) => {
    try {
        const foodLocation = await FoodLocation.find()

        const queryKeys = Object.keys(req.query)

        if(queryKeys.length > 0) {
            const filteredFoodPlaces = foodLocation.filter((location) =>{
                const casedLocationName = location.name.toLowerCase()
                return casedLocationName.includes(req.query.name.toLowerCase())
            })
            res.json(filteredFoodPlaces)
        } else {
            res.json(foodLocation)
        }

    } catch (error) {
        next()
    }
})

locationsRouter.get('/:id', async (req, res, next) => {
    try {
        const foodLocation = await FoodLocation.findById(req.params.id)
        res.json(foodLocation)
    } catch (error) {
        next()
    }
})

locationsRouter.put('/:id', passport.authenticate('jwt', { session: false }), checkIfAdmin, async (req, res, next) => {
    try {
        const toUpdate = FoodLocation.findByIdAndUpdate(req.params.id, req.body)
        const selectedFoodLocation = await FoodLocation.findById(req.params.id)
        await toUpdate.exec(async error => {
            if (error) {
                next()
            }
            const FoodLocationAfterUpdate = await FoodLocation.findById(req.params.id)
            res.json({
                message: "Successfully updated!",
                id: req.params.id,
                name: FoodLocationAfterUpdate.name,
                address: FoodLocationAfterUpdate.address,
                rating: FoodLocationAfterUpdate.rating,
            })
        })
    } catch (error) {
        next()
    }
})

locationsRouter.delete('/:id', passport.authenticate('jwt', { session: false }), checkIfAdmin, async (req, res, next) => {
    const toDelete = FoodLocation.findByIdAndDelete(req.params.id)
    await toDelete.exec(error => {
        if (error) {
            next()
        }
        res.json({ message: "Successful Delete" })
    })
})

module.exports = (app) => {
    app.use('/locations', locationsRouter)
}