const FoodLocation = require('../models/location')
const { locationsInputFields, sendSuccessfulCreationMessage } = require('../utility/foodLocationsUtility')

const createNewFoodLocation = async (req, res, next) => {
    try {
        const newFoodLocation = new FoodLocation(locationsInputFields(req))
        await newFoodLocation.save()

        sendSuccessfulCreationMessage(req, res)

    } catch (error) {
        next(error)
    }
}

module.exports = {
    createNewFoodLocation
}