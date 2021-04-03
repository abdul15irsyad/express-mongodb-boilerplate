var express = require('express');
var router = express.Router();

const user = require('./user')
const book = require('./book')

router.use('/user', user);
router.use('/book', book);

module.exports = router;