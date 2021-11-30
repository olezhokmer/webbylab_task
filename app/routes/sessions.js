const router = require('express').Router();
const controller = require('../controllers/sessions');

router
    .post('/', controller.create)

module.exports = router;