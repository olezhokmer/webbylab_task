const router = require('express').Router();
const controller = require('../controllers/movies')
const usersMiddleware = require('../middleware/users');
const fileupload = require("express-fileupload");

router
    .use(usersMiddleware.injectUser, usersMiddleware.isAuthenticated)
    .post('/', controller.create)
    .delete('/:id', controller.delete)
    .patch('/:id', controller.update)
    .get('/:id', controller.show)
    .get('/', controller.list)
    .post('/import', fileupload(), controller.import)

module.exports = router;