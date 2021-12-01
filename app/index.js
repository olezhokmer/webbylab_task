const express = require("express");
const app = express();
const User = require('./models/users');
const sequelize = require('./util/database');

app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Methods', 'GET','POST','PUT','DELETE','PATCH');
    next();
});

app.use('/api/v1/movies', require('./routes/movies'));
app.use('/api/v1/sessions', require('./routes/sessions'));
app.use('/api/v1/users', require('./routes/users'));

(async () =>{
    try {
        await sequelize.sync({ force: false });
        app.listen(process.env.APP_PORT);
    } catch (error) {
        console.error(error);
    }
})();
