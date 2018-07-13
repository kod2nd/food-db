const mongoose = require('mongoose')

const locationSchema = mongoose.Schema({
    name: String,
    address: String
})

const FoodLocation = mongoose.model('FoodLocation', locationSchema)

module.exports = FoodLocation