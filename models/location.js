const mongoose = require('mongoose')

const locationSchema = mongoose.Schema({
    name: String,
    address: String,
    rating: Number
})

const FoodLocation = mongoose.model('FoodLocation', locationSchema)

module.exports = FoodLocation