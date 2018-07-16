const express = require('express')
const bodyParser = require('body-parser')
const app = express()
require('dotenv').config()
app.use(bodyParser())
app.use(express.json())

// API-Documentation
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger-deploy.json');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
const indexRouter = require('./routes/index')
const locationsRouter = require('./routes/locations')
const usersRouter = require('./routes/users')

indexRouter(app)
locationsRouter(app)
usersRouter(app)

// Error Handlers
app.use((req, res, next) => {
    res.status(404).json({error: "invalid request!"});
})

module.exports = app