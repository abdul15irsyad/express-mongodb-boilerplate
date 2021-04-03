var express = require('express');
var router = express.Router();

const { APP_NAME, APP_DESC } = require('../config/app');
const api = require('./api')

router.get('/', (req, res) => {
    res.render('index', { APP_NAME, APP_DESC })
})

router.use('/api', api)

module.exports = router;