const User = require('../models/user');
const usersService = require('../services/users');

exports.create = async (req, res, next) => {
    try {
        if(!usersService.isValidEmail(req.body.email)) return res.status(400).json("Invalid email.");
        if(!usersService.isValidPass(req.body.password)) return res.status(400).json("Password length must be atleast 8 symbols long.");
        if(!usersService.isValidName(req.body.name)) return res.status(400).json("Invalid name.");
        if(req.body.password != req.body.confirmPassword) return res.status(400).json("Password is not confirmed.");
        const UserModel = {
            name: req.body.name,
            email: req.body.email,
            password: usersService.hashPass(req.body.password)
        };

        const user = await User.create(UserModel);
        const session = usersService.createSession(user.id);
        return res.status(201).json(session);
    } catch (error) {
        return res.status(500).json(error);
    }
};