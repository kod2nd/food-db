const locationsInputFields = (req) => {
    return {
        name: req.body.name,
        address: req.body.address,
        lat: req.body.lat,
        lng: req.body.lng,
        rating: req.body.rating
    }
}

const sendSuccessfulCreationMessage = (req, res) => {
    return res.status(201).json({ message: "Created food location " + req.body.name })
}


module.exports = { 
    locationsInputFields,
    sendSuccessfulCreationMessage
 } 
