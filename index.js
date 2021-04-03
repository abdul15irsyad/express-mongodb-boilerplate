const express = require('express')
const app = express()
const cors = require('cors')
const { PORT } = require('./config/app')
require('dotenv').config()
// mongo db connect
require('./config/mongodb')

const routes = require('./routes')

app.set('view engine', 'pug')
app.set('views', './views')

app.use('/', express.static('public'))
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/', routes)

app.listen(PORT, () => console.log(`server running on port ${PORT}`))