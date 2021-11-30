const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

exports.isValidEmail = (email) => typeof email === 'string' && String(email).toLowerCase().match(emailRegex);

exports.isValidPass = (pass) => typeof pass === 'string' && pass.length < 8;

exports.isValidName = (name) => typeof name === 'string' && name;

exports.createSession = (id) => {
    const date = new Date().toString();
    const token = jwt.sign({
        id,
        date
    }, process.env.JWT_SECRET);
    
    return {
        token,
        status: 1
    }
}

exports.hashPass = (pass) => bcrypt.hash(pass, bcrypt.genSalt());

exports.comparePass = (pass, hash) => bcrypt.compare(pass, hash);

exports.varifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    }
    catch(e){ 
        return false; 
    }
}






