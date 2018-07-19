const express = require('express')
const request = require('supertest')

const dummyApp = express()

const { MongoMemoryServer } = require('mongodb-memory-server')
const mongod = new MongoMemoryServer();
const mongoose = require('mongoose')

const locationsRouter = require('./locations')
const usersRouter = require('./users')
const User = require('../models/user')
const FoodLocation = require('../models/location')
locationsRouter(dummyApp)
usersRouter(dummyApp)

// Dummy Locations
let dummyLocations = {}

const addDummyLocations = async () => {
    const location1 = new FoodLocation({
        name: 'Good Food',
        address: "Somewhere Street",
        lat: 103.82321,
        lng: 1.24125,
        rating: 9
    })

    const location2 = new FoodLocation({
        name: 'Alright Food',
        address: "Over There Avenue",
        lat: 103.82421,
        lng: 1.24165,
        rating: 6
    })

    dummyLocations.location1 = await location1.save()
    dummyLocations.location2 = await location2.save()
}

// User Login
let adminBearerjwtToken

const signUp = async (isAdmin = false) => {
    let signUpResponse = await request(dummyApp)
        .post('/users/signup')
        .send({
            username: "admin",
            password: "12345678",
            admin: isAdmin
        });
}

const signIn = async () => {
    let signInResponse = await request(dummyApp)
        .post('/users/signin')
        .send({
            username: "admin",
            password: "12345678"
        })
    adminBearerjwtToken = "bearer " + signInResponse.body.token;
}


// Tests
beforeAll(async () => {
    jest.setTimeout(120000);
    const uri = await mongod.getConnectionString();
    await mongoose.connect(uri)

    await addDummyLocations()
    await signUp(true)
    await signIn()
})

test('GET/locations body should have length 2 ', async () => {
    const response = await request(dummyApp).get('/locations')
    expect(response.status).toBe(200)
    expect(response.body.length).toBe(2)
});

test('GET/locations/:id should return the location based on the id that the user has searched for.', async () => {
    const response = await request(dummyApp).get(`/locations/${dummyLocations.location2._id}`)

    expect(response.status).toBe(200)
    expect(response.body._id).toBe(String(dummyLocations.location2._id))
});

test('POST/locations Lat and Lng are required fields. Should return a 500 status if required field(s) are not presented.', async () => {
    const response = await request(dummyApp)
        .post('/locations')
        .send({
            name: "Without lng",
            address: "Without lng",
            lat: 103.841602,
            rating: 0
        })
        .set("Authorization", adminBearerjwtToken)
    expect(response.status).toBe(500)
});

test('POST/locations should return a 201 status and increase the Food locations list by 1. newLocations search should find the newly created location.',
    async () => {
        const response = await request(dummyApp)
            .post('/locations')
            .send({
                name: "Posted name",
                address: "Posted address",
                lat: 103.841602,
                lng: 1.279451,
                rating: 7
            })
            .set("Authorization", adminBearerjwtToken)
        expect(response.status).toBe(201)
        const updatedList = await request(dummyApp).get('/locations')
        const newLocationSearch = await FoodLocation.find({ name: "Posted name" })
        expect(updatedList.body.length).toBe(3)
        expect(newLocationSearch.length).toBe(1)
    });

test('PUT/locations/:id should return a message that a location has been updated. Should also update the location in the db', async () => {
    const response = await request(dummyApp).put(`/locations/${dummyLocations.location2._id}`).send({ name: "updated name" }).set("Authorization", adminBearerjwtToken)
    const searchedLocation = await FoodLocation.findById(dummyLocations.location2._id)
    expect(response.status).toBe(200)
    expect(searchedLocation.name).toBe("updated name")
});

test('DELETE/locations/:id should return a 200 status and remove the deleted location from the list', async () => {
    const response = await request(dummyApp)
        .delete(`/locations/${dummyLocations.location1._id}`)
        .set("Authorization", adminBearerjwtToken)
    const searchedLocation = await FoodLocation.find({ _id: dummyLocations.location1._id })
    expect(response.status).toBe(200)
    expect(searchedLocation.length).toBe(0)
});

afterAll(() => {
    mongoose.disconnect();
    mongod.stop()
})
