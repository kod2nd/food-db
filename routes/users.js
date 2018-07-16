const express = require('express')
const usersRouter = express.Router()
const User = require('../models/user')
const bodyParser = require('body-parser')
usersRouter.use(bodyParser())

usersRouter.post('/', async (req, res, next) => {
    try {
        const newUser = new User({
            name: req.body.name,
            age: req.body.age,
            admin: req.body.admin
        })
        await newUser.save()
        res.status(201).json({ message: "Updated user " + req.body.name })
    } catch (error) {
        next()
    }
})

usersRouter.get('/', async (req, res, next) => {
    try {
        const users = await User.find()
        res.json(users)
    } catch (error) {
        next()
    }
})

usersRouter.get('/:id', async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id)
        res.json(user)
    } catch (error) {
        next()
    }
})

usersRouter.put('/:id', async (req, res, next) => {
    try {
        const toUpdate = User.findByIdAndUpdate(req.params.id, req.body)
        const selectedUser = await User.findById(req.params.id)
        await toUpdate.exec(error => {
            if (error) {
                next()
            }
            res.json({
                message: "Successfully updated!",
                id: req.params.id,
                name: selectedUser.name,
                age: selectedUser.age,
                admin: selectedUser.admin,
            })
        })
    } catch (error) {
        next()
    }
})

usersRouter.delete('/:id', async (req, res, next) => {
    const toDelete = User.findByIdAndDelete(req.params.id)
    await toDelete.exec(error => {
        if (error) {
            next()
        }
        res.json({ message: "Successful Delete" })
    })
})

module.exports = (app) => {
    app.use('/users', usersRouter)
}