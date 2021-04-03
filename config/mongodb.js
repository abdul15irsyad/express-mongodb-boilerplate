const mongoose = require('mongoose')
const { MONGODB_URI } = require('./app')

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
}, (err) => err ? console.log(err) : console.log('mongodb connected'))

module.exports = mongoose