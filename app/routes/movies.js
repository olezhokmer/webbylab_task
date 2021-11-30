const router = require('express').Router();
const controller = require('../controllers/movies')
const usersMiddleware = require('../middleware/users');

router
    .use(usersMiddleware.injectUser, usersMiddleware.isAuthenticated)
    .get('/', controller.getHello)

module.exports = router;