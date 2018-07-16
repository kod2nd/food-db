const app = require('./app');
const mongoose = require('mongoose')
const mongodb_uri = process.env.MONGODB_URI || "mongodb://localhost/jumpstart"
mongoose.connect(mongodb_uri)
const db = mongoose.connection
db.on('error', error => {
    console.error('An error occurred!', error)
})

const server = app.listen(process.env.PORT || 3000, () => {
  console.log(`Listening on port ${server.address().port}...`);
});
