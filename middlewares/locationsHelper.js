const FoodLocation = require('../models/location')

const createNewFoodLocation = async (req, res, next) => {
    try {
        const newFoodLocation = new FoodLocation({
            name: req.body.name,
            address: req.body.address,
            lat: req.body.lat,
            lng: req.body.lng,
            rating: req.body.rating
        })
        await newFoodLocation.save()
        res.status(201).json({ message: "Created food location " + req.body.name })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    createNewFoodLocation
}