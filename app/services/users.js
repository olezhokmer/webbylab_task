const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

class UsersService {
    isValidEmail(email) {
        return typeof email === 'string' && String(email).toLowerCase().match(emailRegex);
    }

    isValidPass(pass) {
        return typeof pass === 'string' && pass.length >= 8;
    }

    isValidName(name) {
        return typeof name === 'string' && name;
    }

    createSession(id) {
        const date = new Date().toString();
        const token = jwt.sign({
            id,
            date
        }, process.env.JWT_SECRET);
        
        const session = {
            token,
            status: 1
        }
        return session;
    }

    async hashPass(pass){
        return await bcrypt.hash(pass, 10);
    }

    async comparePass(pass, hash) {
        return await bcrypt.compare(pass, hash);
    }

    varifyToken(token) {
        try {
            return jwt.verify(token, process.env.JWT_SECRET);
        }
        catch(e) {
            return false; 
        }
    }
}

module.exports = new UsersService();







