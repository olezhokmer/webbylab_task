const Sequelize = require('sequelize');
const db = require('../util/database');

const Movie = db.define('movies',{
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    title: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    year: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    format: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

module.exports = Movie;