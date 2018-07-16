const express = require('express')
const request = require('supertest')

const dummyApp = express()

const { MongoMemoryServer } = require('mongodb-memory-server')
const mongod = new MongoMemoryServer();
const mongoose = require('mongoose')

const usersRouter = require('./users')
const User = require('../models/user')
usersRouter(dummyApp)

let dummyUsers = {}

const addDummyUsers = async () => {
    const userAdmin = new User({
        name: "Admin",
        age: 100,
        admin: false
    })

    const user1 = new User({
        name: "Steve",
        age: 20,
        admin: false
    })

    const user2 = new User({
        name: "Holger",
        age: 50,
        admin: false
    })

    dummyUsers.userAdmin = await userAdmin.save()
    dummyUsers.user1 = await user1.save()
    dummyUsers.user2 = await user2.save()
}

beforeAll(async () => {
    jest.setTimeout(120000);
    const uri = await mongod.getConnectionString();
    await mongoose.connect(uri)

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
    // expect(response.body._id).toBe(dummyUsers.userAdmin._id)
});

test.skip('POST/users should return a 201 status and increase the Food locations list by 1. newLocations search should find the newly created location.',
    async () => {
        const response = await request(dummyApp)
            .post('/locations')
            .send({
                name: "Posted name",
                address: "Posted address",
                rating: 7
            })
        expect(response.status).toBe(201)
        const updatedList = await request(dummyApp).get('/locations')
        const newLocationSearch = await FoodLocation.find({ name: "Posted name" })
        expect(updatedList.body.length).toBe(3)
        expect(newLocationSearch.length).toBe(1)
    });

test('PUT/users/:id should return a message that a location has been updated. Should also update the location in the db', async () => {
    const response = await request(dummyApp).put(`/users/${dummyUsers.user2._id}`).send({ name: "updated name" })
    const searchedUser = await User.findById(dummyUsers.user2._id)
    expect(response.status).toBe(200)
    expect(searchedUser.name).toBe("updated name")
});

afterAll(() => {
    mongoose.disconnect();
    mongod.stop()
})