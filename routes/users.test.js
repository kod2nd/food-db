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
        username: "admintester",
        name: "Admin Tester",
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

// User Login
let BearerjwtToken

const signUp = async (username, isAdmin = false) => {
    let signUpResponse = await request(dummyApp)
        .post('/users/signup')
        .send({
            username: username,
            password: "12345678",
            admin: isAdmin
        });
}

const signIn = async (username) => {
    let signInResponse = await request(dummyApp)
        .post('/users/signin')
        .send({
            username: username,
            password: "12345678"
        })
    BearerjwtToken = "bearer " + signInResponse.body.token;
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

test('GET/users body should have length 4 (3 Dummy Users and 1 new signup) ', async () => {
    const username = "admin1"
    await signUp(username, true)
    await signIn(username)
    const response = await request(dummyApp).get('/users').set("Authorization", BearerjwtToken)
    expect(response.status).toBe(200)
    expect(response.body.length).toBe(4)
});

describe('GET/:id Admin or the user himself can send a GET request for a specific user', () => {
    test('GET/:id should return the user searched for. Admin has access to the User.', async () => {
        const username = "admin1"
        await signUp(username, true)
        await signIn(username)
        const response = await request(dummyApp).get(`/users/${dummyUsers.user1._id}`).set("Authorization", BearerjwtToken)
        expect(response.status).toBe(200)
        expect(response.body._id).toBe(String(dummyUsers.user1._id))
    });

    test('GET/:id should return the user searched for. User himself has access to the User.', async () => {
        const username = "userfortest"
        await signUp(username, false)
        await signIn(username)

        const userForTest = await User.findOne({ username: "userfortest" })

        const response = await request(dummyApp).get(`/users/${userForTest._id}`).set("Authorization", BearerjwtToken)
        expect(response.status).toBe(200)
        expect(response.body._id).toBe(String(userForTest._id))
    });

    test('GET/:id A user should not be able to access another user using the GET request. Return 401 status .', async () => {
        const username = "faileduser"
        await signUp(username, false)
        await signIn(username)
        const response = await request(dummyApp).get(`/users/${dummyUsers.user1._id}`).set("Authorization", BearerjwtToken)
        expect(response.status).toBe(401)
    });

})

describe('PUT/:id Admin or the user himself can send a PUT request for a specific user', () => {
    test('PUT/users/:id Admin should have rights up update a user. Should return a message that a user has been updated. Should also update the user in the db', async () => {
        const username = "admin1"
        await signUp(username, true)
        await signIn(username)
        const response = await request(dummyApp)
            .put(`/users/${dummyUsers.user2._id}`)
            .send({ name: "updatedname" })
            .set("Authorization", BearerjwtToken)
        const searchedUser = await User.findById(dummyUsers.user2._id)
        expect(response.status).toBe(200)
        expect(searchedUser.name).toBe("updatedname")
    });

    test('PUT/users/:id User should have rights up update a user. Should return a message that a user has been updated. Should also update the user in the db', async () => {
        const username = "userfortest"
        await signUp(username, false)
        await signIn(username)

        const userForTest = await User.findOne({ username: "userfortest" })

        const response = await request(dummyApp)
            .put(`/users/${userForTest._id}`)
            .send({ name: "updatedname" })
            .set("Authorization", BearerjwtToken)
        const searchedUser = await User.findById(userForTest._id)
        expect(response.status).toBe(200)
        expect(searchedUser.name).toBe("updatedname")
    });

    test('PUT/users/:id Admin should have rights up update a user. Should return a message that a user has been updated. Should also update the user in the db', async () => {
        const username = "faileduser"
        await signUp(username, false)
        await signIn(username)
        const response = await request(dummyApp)
            .put(`/users/${dummyUsers.user2._id}`)
            .send({ name: "updatedname" })
            .set("Authorization", BearerjwtToken)
        expect(response.status).toBe(401)
    });
})

describe('DELETE/:id Admin or the user himself can send a DELETE request for a specific user', () => {
    test('DELETE/users/:id Admin should be able to delete a user. should return a 200 status and remove the deleted user from the list', async () => {
        const username = "admin1"
        await signUp(username, true)
        await signIn(username)

        const response = await request(dummyApp).delete(`/users/${dummyUsers.user1._id}`).set("Authorization", BearerjwtToken)
        const searchedUser = await User.find({ _id: dummyUsers.user1._id })
        expect(response.status).toBe(200)
        expect(searchedUser.length).toBe(0)
    });

    test('DELETE/users/:id User should be able to himself. should return a 200 status and remove the deleted user from the list', async () => {
        const username = "userfortest"
        await signUp(username, false)
        await signIn(username)

        const userForTest = await User.findOne({ username: "userfortest" })

        const response = await request(dummyApp).delete(`/users/${userForTest._id}`).set("Authorization", BearerjwtToken)
        const searchedUser = await User.find({ _id: userForTest._id })
        expect(response.status).toBe(200)
        expect(searchedUser.length).toBe(0)
    });

    test('DELETE/users/:id User should not be able to delete another user. should return a 200 status and remove the deleted user from the list', async () => {
        const username = "faileduser"
        await signUp(username, false)
        await signIn(username)

        const response = await request(dummyApp).delete(`/users/${dummyUsers.user1._id}`).set("Authorization", BearerjwtToken)
        expect(response.status).toBe(401)
    });

})

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

describe('POST/users/:id/locations', () => {
    test('POST/users/:id/locations If posted location is not in users location. Should return a 200 status. Location should be in the Food FoodLocations Database and the location should be added to the users locations array ', async () => {
        const lat = 99.1238
        const lng = 1.0324
        const username = "userfortest"
        await signUp(username, false)
        await signIn(username)
        const user = await User.findOne({ username: username })
        const response = await request(dummyApp)
            .post(`/users/${user._id}/locations`)
            .send({
                name: "Cafe Koffee",
                lat: lat,
                lng: lng
            })
            .set("Authorization", BearerjwtToken)

        const cafeInDB = await FoodLocation.find({ lat: lat, lng: lng })
        const updatedUser = await User.findOne({ username: username })
        let locationExists = 0
        if (updatedUser.locations.indexOf(cafeInDB[0]._id) > -1) {
            locationExists = 1
        }
        expect(response.status).toBe(200)
        expect(cafeInDB.length).toBe(1)
        expect(locationExists).toBe(1)
    });

    test('POST/users/:username/locations If a posted location already exists in the users account, return a 400 status.', async () => {
        const lat = 99.1238
        const lng = 1.0324
        const username = "userfortest"
        await signUp(username, false)
        await signIn(username)
        const user = await User.findOne({ username: username })
        const postingLocation = async () => {
            return (
                await request(dummyApp)
                    .post(`/users/${user._id}/locations`)
                    .send({
                        name: "Cafe Koffee",
                        lat: lat,
                        lng: lng
                    })
                    .set("Authorization", BearerjwtToken)
            )
        }

        await postingLocation()
        const response = await postingLocation()

        expect(response.status).toBe(400)
    });
})

describe('GET/users/:id/locations', () => {
    test('GET/users/:id/locations Only if signed in with a token will it return an to return an array', async () => {
        const username = "userfortest"
        await signUp(username, false)
        await signIn(username)
        const response = await request(dummyApp).get(`/users/${dummyUsers.user1._id}/locations`).set("Authorization", BearerjwtToken)
        expect(response.status).toBe(200)
        expect(Array.isArray(response.body)).toBe(true)
    });

    test('GET/users/:id/locations If not signed in with a token return a 401 status', async () => {
        const response = await request(dummyApp).get(`/users/${dummyUsers.user1._id}/locations`)
        expect(response.status).toBe(401)
    });
})

describe('Delete/users/:id/locations/:locationid', () => {
    test('Delete/users/:id/locations/:locationid Admin can delete a users location. To return status of 200 if supplied with a valid ID', async () => {
        const lat = 99.1238
        const lng = 1.0324
        const username = "admin1"
        await signUp(username, true)
        await signIn(username)
        const user = await User.findOne({ username: dummyUsers.user1.username })
        await request(dummyApp)
            .post(`/users/${dummyUsers.user1._id}/locations`)
            .send({
                name: "Cafe Koffee",
                lat: lat,
                lng: lng
            })
            .set("Authorization", BearerjwtToken)
        const locationToDelete = await FoodLocation.findOne({ lat: lat, lng: lng })
        const response = await request(dummyApp).delete(`/users/${dummyUsers.user1._id}/locations/${locationToDelete._id}`).set("Authorization", BearerjwtToken)
        expect(response.status).toBe(200)
    });

    test('Delete/users/:id/locations/:locationid User can delete his own location. To return status of 200 if supplied with a valid ID', async () => {
        const lat = 99.1238
        const lng = 1.0324
        const username = "userfortest"
        await signUp(username, false)
        await signIn(username)
        const user = await User.findOne({ username: username })
        await request(dummyApp)
            .post(`/users/${user._id}/locations`)
            .send({
                name: "Cafe Koffee",
                lat: lat,
                lng: lng
            })
            .set("Authorization", BearerjwtToken)
        const locationToDelete = await FoodLocation.findOne({ lat: lat, lng: lng })
        const response = await request(dummyApp).delete(`/users/${user._id}/locations/${locationToDelete._id}`).set("Authorization", BearerjwtToken)
        expect(response.status).toBe(200)
    });

    test('Delete/users/:id/locations/:locationid User cannot delete another users location. To return status of 401', async () => {
        const lat = 99.1238
        const lng = 1.0324
        const username = "userfortest"
        await signUp(username, false)
        await signIn(username)
        const user = await User.findOne({ username: username })
        await request(dummyApp)
            .post(`/users/${user._id}/locations`)
            .send({
                name: "Cafe Koffee",
                lat: lat,
                lng: lng
            })
            .set("Authorization", BearerjwtToken)
        const locationToDelete = await FoodLocation.findOne({ lat: lat, lng: lng })
        const response = await request(dummyApp).delete(`/users/${user._id}/locations/${locationToDelete._id}`).set("Authorization", "Some invalid token")
        expect(response.status).toBe(401)
    });

    test('Delete/users/:id/locations/:locationid to return status of 400 if a wrong locationid is supplied', async () => {
        const lat = 99.1238
        const lng = 1.0324
        const wrongLocationID = '2wrong4anID'
        const username = "userfortest"
        await signUp(username, false)
        await signIn(username)
        const user = await User.findOne({ username: username })
        await request(dummyApp)
            .post(`/users/${user._id}/locations`)
            .send({
                name: "Cafe Koffee",
                lat: lat,
                lng: lng
            })
            .set("Authorization", BearerjwtToken)
        const locationToDelete = await FoodLocation.findOne({ lat: lat, lng: lng })
        const response = await request(dummyApp).delete(`/users/${user._id}/locations/${wrongLocationID}`).set("Authorization", BearerjwtToken)
        expect(response.status).toBe(400)
    });
})


afterAll(() => {
    mongoose.disconnect();
    mongod.stop()
})