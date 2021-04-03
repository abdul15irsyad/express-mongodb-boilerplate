var express = require('express');
const { APP_NAME, APP_DESC } = require('../../config/app');
var router = express.Router();

const v1 = require('./v1')

router.use('/v1', v1);
router.get('/', (req, res) => {
    res.status(200).json({
        status: true,
        title: APP_NAME,
        desc: APP_DESC
    })
})

module.exports = router;