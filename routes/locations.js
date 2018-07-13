const express = require('express')
const locationsRouter = express.Router()
const FoodLocation = require('../models/location')

locationsRouter.get('/', async (req, res, next) => {
    try {
        const foodLocation = await FoodLocation.find()
        res.json(foodLocation)
    } catch (error) {
        next()
    }
})

locationsRouter.post('/', async (req, res, next) => {
    try {
        const newFoodLocation = new FoodLocation({
            name: req.body.name,
            address: req.body.address
        })
        await newFoodLocation.save()
        res.json({ message: "Updated food location " + req.body.name })
    } catch (error) {
        next()
    }
})

module.exports = (app) => {
    app.use('/locations', locationsRouter)
}