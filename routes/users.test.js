const express = require('express')
const request = require('supertest')

const dummyApp = express()

const { MongoMemoryServer } = require('mongodb-memory-server')
const mongod = new MongoMemoryServer();
const mongoose = require('mongoose')

const usersRouter = require('./users')
const User = require('../models/user')
const FoodLocation = require('../models/location')
usersRouter(dummyApp)

let dummyUsers = {}

const addDummyUsers = async () => {
    const userAdmin = new User({
        username: "admin",
        name: "Admin",
        age: 100,
        admin: true,
        locations: []
    })

    const user1 = new User({

        username: "steve",
        name: "Steve",
        age: 20,
        admin: false,
        locations: []
    })

    const user2 = new User({
        username: "holger",
        name: "Holger",
        age: 50,
        admin: false,
        locations: []
    })

    dummyUsers.userAdmin = await userAdmin.save()
    dummyUsers.user1 = await user1.save()
    dummyUsers.user2 = await user2.save()
}

beforeAll(async () => {
    jest.setTimeout(120000);
    const uri = await mongod.getConnectionString();
    await mongoose.connect(uri)
})

beforeEach(async () => {
    mongoose.connection.db.dropDatabase()
    await addDummyUsers()
})

test('GET/users body should have length 3 ', async () => {
    const response = await request(dummyApp).get('/users')
    expect(response.status).toBe(200)
    expect(response.body.length).toBe(3)
});

test('GET/:id should return the user searched for', async () => {
    const response = await request(dummyApp).get(`/users/${dummyUsers.userAdmin._id}`)
    expect(response.status).toBe(200)
    expect(response.body._id).toBe(String(dummyUsers.userAdmin._id))
});


test('PUT/users/:id should return a message that a user has been updated. Should also update the user in the db', async () => {
    const response = await request(dummyApp).put(`/users/${dummyUsers.user2._id}`).send({ name: "updatedname" })
    const searchedUser = await User.findById(dummyUsers.user2._id)
    expect(response.status).toBe(200)
    expect(searchedUser.name).toBe("updatedname")
});

test('DELETE/users/:id should return a 200 status and remove the deleted user from the list', async () => {
    const response = await request(dummyApp).delete(`/users/${dummyUsers.user1._id}`)
    const searchedUser = await User.find({ _id: dummyUsers.user1._id })
    expect(response.status).toBe(200)
    expect(searchedUser.length).toBe(0)
});

test('POST/signup should return status 201 and send success message to the user. It should also update the user database with the newly created user', async () => {
    const response = await request(dummyApp)
        .post('/users/signup')
        .send({
            username: "newSignUpUser",
            password: "12345678"
        })
    const searchedUser = await User.findOne({ username: "newSignUpUser" })
    expect(response.status).toBe(201)
    expect(response.body.message.length).toBeGreaterThan(0)
    expect(searchedUser).toHaveProperty('username', 'newsignupuser')
});

test('POST/signup should return status 500 if no username is provided', async () => {
    const response = await request(dummyApp)
        .post('/users/signup')
        .send({
            password: "12345678"
        })
    expect(response.status).toBe(500)
});

test('POST/users/:username/locations If not in users location. Should return a 200 status. Location should be in the Food Locations Database and Location should be added to the users locations array ', async () => {
    const lat = 99.1238
    const lng = 1.0324
    const response = await request(dummyApp)
        .post(`/users/${dummyUsers.user2.username}/locations`)
        .send({
            name: "Cafe Koffee",
            lat: lat,
            lng: lng
        })

    const cafeInDB = await FoodLocation.find({ lat: lat, lng:lng })
    const user = await User.findOne({username: dummyUsers.user2.username})
    let locationExists = 0
    if(user.locations.indexOf(cafeInDB[0]._id) > -1){
        locationExists = 1
    }
    expect(response.status).toBe(200)
    expect(cafeInDB.length).toBe(1)
    expect(locationExists).toBe(1)
});

afterAll(() => {
    mongoose.disconnect();
    mongod.stop()
})