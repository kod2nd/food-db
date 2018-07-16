const express = require('express')
const indexRouter = express.Router()
const bodyParser = require('body-parser')
indexRouter.use(bodyParser())

indexRouter.get('/', (req, res, next) => {
    res.json({
        message: "Welcome!",
        help: "Please refer to /api-docs for help"
    })
})

module.exports = (app) => {
    app.use('/', indexRouter)
}