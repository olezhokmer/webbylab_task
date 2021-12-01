const User = require('../models/users');
const usersService = require('../services/users');

exports.create = async (req, res, next) => {
    try {
        const user = await User.findOne({ where: { email: req.body.email } });
        if(!user) return res.status(400).json("User with this email not found.");
        if(!await usersService.comparePass(req.body.password, user.password)) return res.status(400).json("Incorrect password.");

        const session = usersService.createSession(user.id);
        return res.status(201).json(session);
    } catch (error) {
        return res.status(500).json(error);
    }
};