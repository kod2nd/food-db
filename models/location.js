const mongoose = require('mongoose')

const locationSchema = mongoose.Schema({
    name: String,
    address: String,
    lat: {type: Number, required: true},
    lng: {type: Number, required: true},
    rating: Number
})

const FoodLocation = mongoose.model('FoodLocation', locationSchema)

module.exports = FoodLocation