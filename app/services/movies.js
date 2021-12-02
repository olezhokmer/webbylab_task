const Movie = require('../models/movies');
const Actor = require('../models/actors');
const ActorByMovie = require('../models/actorsByMovies');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const movieFormats = ["DVD", "VHS", "Blu-Ray"]

class MoviesService {

    validateMovieDto(dto) {
        if(!dto || dto.constructor != ({}).constructor) throw "Invalid body type."
        if(!this.validateTitle(dto.title)) throw "Empty title.";
        if(!this.validateYear(dto.year)) throw "Invalid year.";
        if(!this.validateFormat(dto.format)) throw "Invalid format.";
        if(!this.validateActors(dto.actors)) throw "Invalid actors.";
    }
    validateMovieDtoForUpdate(dto) {
        if(!dto || dto.constructor != ({}).constructor) throw "Invalid body type."
        if(dto.title && !this.validateTitle(dto.title)) throw "Empty title.";
        if((dto.year || dto.year == 0) && !this.validateYear(dto.year)) throw "Invalid year.";
        if(dto.format && !this.validateFormat(dto.format)) throw "Invalid format.";
        if(dto.actors && !this.validateActors(dto.actors)) throw "Invalid actors.";
    }
    validateTitle(title) {
        if(typeof title != 'string' && !title) return false; else return true;
    }

    validateYear(year) {
        if(typeof year != 'number') return false; else return true;
    }

    validateFormat(format) {
        if(!movieFormats.includes(format)) return false; else return true;
    }

    validateActors(actors){
        if(!Array.isArray(actors)) return false; else return true;
    }

    async createSingleMovie(movie) {
        try {
            const MOVIE_MODEL = {
                title: movie.title,
                year: movie.year,
                format: movie.format
            }
    
            let created = await Movie.create(MOVIE_MODEL)
            let { existed, unique } = await this.getExistedAndInsertNewActors(movie.actors);
            let all = existed.concat(unique)
            let allIds = all.map(a => a.id)
            await this.addActorsToMovie(allIds, created.id)
            
            let parsed = JSON.parse(JSON.stringify(created))
            parsed.actors = all
            return parsed
        } catch (ex) {
            throw ex;
        }
    }
    
    async addActorsToMovie(actorIds, movieId) {
        try {
            const ACTORS_BY_MOVIES_MODEL = actorIds.map(id => { return { actor_id : id, movie_id : movieId } })
            await ActorByMovie.bulkCreate(ACTORS_BY_MOVIES_MODEL)
        } catch (ex) {
            throw ex;
        }
    }

    async getExistedAndInsertNewActors(actorNames) {
        try {
            let found = await Actor.findAll({ where : { name : actorNames }})
            let foundMapped = found.map(a => a.name)
            const NEW_ACTORS_MODEL = actorNames.filter(n => !foundMapped.includes(n)).map(name => { return { name } })
            let unique = await Actor.bulkCreate(NEW_ACTORS_MODEL)
            unique = unique.map(res => res.dataValues)
            return {
                existed : found,
                unique
            }
        } catch (ex) {
            throw ex;
        }
    }

    async getMovieById(id) {
        try {
            let movie = await Movie.findByPk(id)
            let actorsByMovie = await ActorByMovie.findAll({ where : { movie_id : id }})
            let actorIds = actorsByMovie.map(a => a.actor_id)
            let actors = await Actor.findAll({ where : { id: actorIds }})
    
            let parsed = JSON.parse(JSON.stringify(movie))
            parsed.actors = actors
            return parsed
        } catch (ex) {
            throw ex;
        }
    }

    async updateMovieById(id, movie) {
        try {
            let updateQuery = {};
            if(movie.title) updateQuery["title"] = movie.title
            if(movie.year) updateQuery["year"] = movie.year
            if(movie.format) updateQuery["format"] = movie.format

            if(movie.actors && movie.actors.length) {
                await ActorByMovie.destroy({ where : { movie_id : id } })
                let { existed, unique } = await this.getExistedAndInsertNewActors(movie.actors)
                let actors = existed.concat(unique)
                let ids = actors.map(a => a.id)

                await this.addActorsToMovie(ids, id)
            }          
            
            await Movie.update(
                updateQuery,
                { where: { id } }
            )        
        } catch (ex) {
            throw ex;
        }
    }

    async deleteMovieById(id) {
        try {
            await ActorByMovie.destroy({ where : { movie_id : id } })
            await Movie.destroy({ where : { id } })         
        } catch (ex) {
            throw ex;
        }
    }

    async validateMultipleMovies(movies) {
        let uniqueTitles = []
        for (let m of movies) {
            try {
                this.validateMovieDto(m)
                if(!uniqueTitles.includes(m.title)) uniqueTitles.push(m.title);
                else throw "Duplicated movie title " + m.title
            } catch(ex) {
                throw ex;
            }
        }
    }

    async getAlreadyExistedMovieTitles(movieTitles) {
        try {
            const movies = await Movie.findAll({ where : { title : movieTitles } })
            return movies.map(m => m.title)
        } catch(ex) {
            throw ex;
        }
    }

    validateQueryParamsForList(params) {
        if(params.sort && params.sort != 'id' && params.sort != 'title' && params.sort != 'year')
        throw "Invalid sort value."
        if(params.order && params.order != 'ASC' && params.order != 'DESC')
        throw "Invalid order value."
        if(isNaN(Number(params.limit)) || Number(params.limit) < 0) throw "Invalid limit value."
        if(isNaN(Number(params.offset)) || Number(params.offset) < 0) throw "Invalid offset value."
    }

    async listMovies(actor, title, search, sort = 'id', order = 'ASC', limit = 20, offset = 0) {
        try {
            let movieIds = []
            if(actor || search) {
                const actors = await Actor.findAll({ where : { name : { [Op.like] : "%"+(actor ? actor : search)+"%" }}})
                let ids = actors.map(a => a.id)
                const actorsByMovies = await ActorByMovie.findAll({ where : { actor_id : ids } });
                movieIds = actorsByMovies.map(r => r.movie_id) 
            }
            let orQuery = []
            if(!actor && movieIds.length) orQuery.push({ id : movieIds })
            if(!title && search) orQuery.push({ title : { [Op.like] : "%"+search+"%" } })
            let whereQuery = {} 
            if(orQuery.length) whereQuery[Op.or] =  orQuery
            if(actor && movieIds) whereQuery["id"] = movieIds
            if(title) whereQuery["title"] = { [Op.like] : "%"+title+"%" }

            const movies = await Movie.findAll({
                offset, limit,
                where : whereQuery,
                order : [[sort, order]]
            })
            return movies
        } catch(ex) {
            throw ex;
        }
    }

    convertTxtMoviesFileToJson(txt) {

    }

    async createMultipleMovies(movies) {
        try {
            let actorNames = []
            let existedMovieTitles = await this.getAlreadyExistedMovieTitles(movies.map(m => m.title))
            movies = movies.filter(m => !existedMovieTitles.includes(m.title))
            const MOVIE_MODELS = movies.map(m => {
                actorNames = actorNames.concat(m.actors)
                return { title : m.title, year : m.year, format : m.format }
            })
            if(MOVIE_MODELS.length) {
                let moviesCreated = await Movie.bulkCreate(MOVIE_MODELS)
                moviesCreated = moviesCreated.map(m => m.dataValues)
                let { existed, unique } = await this.getExistedAndInsertNewActors(actorNames)
                let allActors = existed.concat(unique)
                allActors = allActors.map(a => a.dataValues)
                let ACTORS_BY_MOVIES_MODELS = []
                for(let m of movies) {
                    let actorIds = allActors.filter(a => m.actors.includes(a.name)).map(a => a.id)
                    let movieId = moviesCreated.find(mov => mov.title == m.title).id
                    let actorsByMovie = actorIds.map(id => { return { actor_id : id, movie_id : movieId } })
                    ACTORS_BY_MOVIES_MODELS = ACTORS_BY_MOVIES_MODELS.concat(actorsByMovie)
                }
                await ActorByMovie.bulkCreate(ACTORS_BY_MOVIES_MODELS)
                return moviesCreated
            } else return []          
        } catch(ex) {
            throw ex;
        }
    }
}

module.exports = new MoviesService();