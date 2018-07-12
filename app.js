const express = require('express')
const bodyParser = require('body-parser')
const app = express()
app.use(bodyParser())
app.use(express.json())

app.get('/',(req,res,next) => {
    res.json({message: "testing the app"})
})





module.exports = app