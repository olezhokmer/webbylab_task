const Sequelize = require('sequelize');
const db = require('../util/database');

const ActorByMovie = db.define('actorsByMovies',{
    actor_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'actors',
            key: 'id'
        }
    },
    movie_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'movies',
            key: 'id'
        }
    }
});

module.exports = ActorByMovie;