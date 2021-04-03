var express = require('express');
var router = express.Router();

const v1 = require('./v1')

router.use('/v1', v1);
router.get('/', (req, res) => {
    res.status(200).json({
        message: 'welcome to my simple rest api'
    })
})

module.exports = router;