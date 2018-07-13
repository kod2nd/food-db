const mongoose = require('mongoose')
const mongodb_uri = process.env.MONGODB_URI || "mongodb://localhost/jumpstart"
mongoose.connect(mongodb_uri)
const db = mongoose.connection
db.on('error', error => {
    console.error('An error occurred!', error)
})

const express = require('express')
const bodyParser = require('body-parser')
const app = express()
require('dotenv').config()
app.use(bodyParser())
app.use(express.json())

const indexRouter = require('./routes/index')
const locationsRouter = require('./routes/locations')

indexRouter(app)
locationsRouter(app)

app.use((req, res, next) => {
    res.status(404).json({error: "invalid request!"});
})


module.exports = app