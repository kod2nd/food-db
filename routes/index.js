const express = require('express')
const indexRouter = express.Router()
indexRouter.use(express.json())

indexRouter.get('/', (req, res, next) => {
    res.json({
        message: "Welcome!",
        help: "Please refer to /api-docs for help"
    })
})

module.exports = (app) => {
    app.use('/', indexRouter)
}