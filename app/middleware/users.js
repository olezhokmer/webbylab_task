const User = require('../models/users');
const usersService = require('../services/users');

exports.injectUser = async (req, res, next) => {
    try {
        const token = req.headers['authorization'];
        const tokenData = usersService.varifyToken(token);
        req.user = tokenData ? await User.findByPk(tokenData.id) : null;

        next();
    } catch (error) {
        return res.status(500).json(error);
    }
};

exports.isAuthenticated = async (req, res, next) => {
    try {
        if(!req.user) return res.status(403).json("Unauthorized.");
        next();
    } catch (error) {
        return res.status(500).json(error);
    }
};