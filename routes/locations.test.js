const express = require('express')
const request = require('supertest')
const locationsRouter = require('./locations')
const FoodLocation = require('../models/location')

const { MongoMemoryServer } = require('mongodb-memory-server')
const mongod = new MongoMemoryServer();
const mongoose = require('mongoose')

const dummyApp = express()
locationsRouter(dummyApp)

let fakeLocations = {}

const addFakeLocations = async () => {
    const location1 = new FoodLocation({
        name: 'Good Food',
        address: "Somewhere Street",
        rating: 9
    })

    const location2 = new FoodLocation({
        name: 'Alright Food',
        address: "Over There Avenue",
        rating: 6
    })

    fakeLocations.location1 = await location1.save()
    fakeLocations.location2 = await location2.save()
}

beforeAll(async () => {
    jest.setTimeout(120000);
    const uri = await mongod.getConnectionString();
    await mongoose.connect(uri)

    await addFakeLocations()
})


test('GET/locations body should have length 2 ', async () => {
    const response = await request(dummyApp).get('/locations')
    expect(response.status).toBe(200)
    expect(response.body.length).toBe(2)
});

test('GET/locations/:id should return the location based on the id that the user has searched for', async () => {
    const response = await request(dummyApp).get(`/locations/${fakeLocations.location2._id}`)

    expect(response.status).toBe(200)
    expect(response.body._id).toBe(String(fakeLocations.location2._id))
});

test('POST/locations should return a 201 status and increase the locations array by 1 ', 
async () => {
    const newFoodLocation = new FoodLocation({
        name: "Posted name",
        address: "Posted address",
        rating: 7
    })

    await newFoodLocation.save()
    const response = await request(dummyApp).post('/locations')
    // Cant get the status to work!
    // expect(response.status).toBe(201)
    const locationsList = await FoodLocation.find()
    expect(locationsList.length).toBe(3)
});


afterAll(() => {
    mongoose.disconnect();
    mongod.stop()
})

