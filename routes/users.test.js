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
        username: "Admin",
        name: "Admin",
        age: 100,
        admin: false
    })

    const user1 = new User({
        username: "Steve",
        name: "Steve",
        age: 20,
        admin: false
    })

    const user2 = new User({
        username: "Holger",
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
    // expect(response.body._id).toBe(dummyUsers.userAdmin._id)
});

// test('POST/users should return a 201 status and increase the Users list by 1. newUser search should find the newly created user.',
//     async () => {
//         const response = await request(dummyApp)
//             .post('/users')
//             .send({
//                 username: "Created User",
//                 name: "Created User",
//                 age: 40,
//                 admin: false
//             })
//         expect(response.status).toBe(201)
//         const updatedList = await request(dummyApp).get('/users')
//         const newUser = await User.find({ name: "Created User" })
//         expect(updatedList.body.length).toBe(4)
//         expect(newUser.length).toBe(1)
//     });

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
    const searchedUser = await User.findOne({username: "newSignUpUser"})
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

afterAll(() => {
    mongoose.disconnect();
    mongod.stop()
})