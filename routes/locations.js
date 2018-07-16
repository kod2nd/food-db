const express = require('express')
const locationsRouter = express.Router()
const FoodLocation = require('../models/location')
const bodyParser = require('body-parser')
locationsRouter.use(bodyParser())

locationsRouter.post('/', async (req, res, next) => {
    try {
        const newFoodLocation = new FoodLocation({
            name: req.body.name,
            address: req.body.address,
            rating: req.body.rating
        })
        await newFoodLocation.save()
        res.status(201).json({ message: "Updated food location " + req.body.name })
    } catch (error) {
        next()
    }
})

locationsRouter.get('/', async (req, res, next) => {
    try {
        const foodLocation = await FoodLocation.find()
        res.json(foodLocation)
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

locationsRouter.put('/:id', async (req, res, next) => {
    try {
        const toUpdate = FoodLocation.findByIdAndUpdate(req.params.id, req.body)
        const selectedFoodLocation = await FoodLocation.findById(req.params.id)
        await toUpdate.exec(error => {
            if (error) {
                next()
            }
            res.json({
                message: "Successfully updated!",
                id: req.params.id, 
                name: selectedFoodLocation.name,
                address: selectedFoodLocation.address,
                rating: selectedFoodLocation.rating,
            })
        })
    } catch (error) {
        next()
    }
})

locationsRouter.delete('/:id', async (req, res, next) => {
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