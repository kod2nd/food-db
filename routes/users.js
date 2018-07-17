const express = require('express')
const usersRouter = express.Router()
const User = require('../models/user')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const { passport, jwtOptions } = require('../config/passport')

usersRouter.use(bodyParser())

// usersRouter.post('/', async (req, res, next) => {

//     try {
//         const newUser = new User({
//             username: req.body.username,
//             name: req.body.name,
//             age: req.body.age,
//             admin: req.body.admin
//         })
//         await newUser.save()
//         res.status(201).json({ message: "Created user " + req.body.name })
//     } catch (error) {
//         next()
//     }
// })

usersRouter.post("/signup", async (req, res, next) => {
    const { username, password, name, age, admin } = req.body;
    if (!password) {
        const noPasswordError = "Please enter a password!"
        next(noPasswordError)
    }
    const user = new User({
        username,
        name: name,
        age: age,
        admin: admin
    });
    user.setHashedPassword(password);
    try {
        await user.save();
        res.status(201).json({ message: "Success! User Created", user });
    } catch (err) {
        next(err);
    }
});
usersRouter.post("/signin", async (req, res) => {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user) {
        res.status(401).json({ message: "no such user found" });
    }

    if (user.validatePassword(password)) {
        const userId = { id: user.id };
        const token = jwt.sign(userId, jwtOptions.secretOrKey);
        res.json({ message: "ok", token: token });
    } else {
        res.status(401).json({ message: "passwords did not match" });
    }
});

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
                message: "Successfully updated user!",
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