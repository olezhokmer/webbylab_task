const User = require('../models/users');
const usersService = require('../services/users');

exports.create = async (req, res, next) => {
    try {
        if(!req.body || req.body.constructor != ({}).constructor) return res.status(400).json("Invalid body type.");
        if(!usersService.isValidEmail(req.body.email)) return res.status(400).json("Invalid email.");
        if(!usersService.isValidPass(req.body.password)) return res.status(400).json("Password length must be atleast 8 symbols long.");
        if(!usersService.isValidName(req.body.name)) return res.status(400).json("Invalid name.");
        if(req.body.password != req.body.confirmPassword) return res.status(400).json("Password is not confirmed.");
        const userExists = Boolean(await User.findOne({ where : { email: req.body.email } }));
        if(userExists) return res.status(400).json("User with this email already exists.");
        const password = await usersService.hashPass(req.body.password)

        const USER_MODEL = {
            name: req.body.name,
            email: req.body.email,
            password
        };
        const user = await User.create(USER_MODEL);
        const session = usersService.createSession(user.id);
        return res.status(201).json(session);
    } catch (error) {
        return res.status(500).json(error);
    }
};