var express = require('express');
var router = express.Router();

const api = require('./api')

router.get('/', (req, res) => {
    res.render('index')
})

router.use('/api', api)

module.exports = router;