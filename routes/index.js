const express = require('express')
const indexRouter = express.Router()

indexRouter.get('/',(req,res,next) => {
    res.json({message: "Welcome!"})
})


module.exports = (app) => {
    app.use('/', indexRouter)
}