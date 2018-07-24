const welcomeMessage = (req, res, next) => {
    res.json({
        message: "Welcome!",
        help: "Please refer to /api-help for help"
    })
}

module.exports = {
    welcomeMessage
}