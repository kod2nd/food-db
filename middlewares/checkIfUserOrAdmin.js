const checkIfUserOrAdmin = (req, res, next) => {
    if (String(req.user._id) === String(req.params.id) || req.user.admin === true) {
        next()
    } else {
        res.status(401).json({ message: "You do not have the required access rights!" })
        return
    }
}

module.exports = checkIfUserOrAdmin