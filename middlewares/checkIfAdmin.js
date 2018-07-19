const checkIfAdmin = (req, res, next) => {
    
    if (req.user.admin !== true) {
        res.status(401).json({ message: "You do not have the required access rights!" })
        return
    } else {
        next()
    }
}

module.exports = checkIfAdmin