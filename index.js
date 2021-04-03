const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
// mongo db connect
require('./config/mongodb')

const port = process.env.PORT || 3000
const routes = require('./routes')

app.set('view engine', 'pug')
app.set('views', './views')

app.use('/', express.static('public'))
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/', routes)

app.listen(port, () => console.log(`server running on port ${port}`))