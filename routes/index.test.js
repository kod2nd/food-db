const express = require('express')
const request = require('supertest')
const indexRouter = require('./index')

const app = express()
indexRouter(app)

test('GET /. Expect welcome message to say welcome!', async () => {
    const response = await request(app).get('/')
    expect(response.status).toBe(200)
    expect(response.body.message).toBe("Welcome!")
});