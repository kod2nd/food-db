const mongoose = require('mongoose')

const locationSchema = mongoose.Schema({
    name: String,
    address: String,
    lat: Number,
    lng: Number,
    rating: Number
})

const FoodLocation = mongoose.model('FoodLocation', locationSchema)

module.exports = FoodLocation