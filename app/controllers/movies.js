const Movie = require('../models/movies');
const Actor = require('../models/actors');
const ActorByMovie = require('../models/actorsByMovies');
const moviesService = require('../services/movies');

exports.create = async (req, res, next) => {
    try {
        try {
            moviesService.validateMovieDto(req.body);
        } catch(ex){
            return res.status(400).json(ex);
        }
        const movieExists = Boolean(await Movie.findOne({ where : { title: req.body.title } }));
        if(movieExists) return res.status(400).json("Movie with this title already exists.");

        const movie = await moviesService.createSingleMovie(req.body);
        return res.status(201).json({ data : movie, status : 1 });
    } catch (error) {
        return res.status(500).json(error);
    }
};
exports.delete = async (req, res, next) => {
    try {
        let id = Number(req.params.id);
        if(isNaN(id)) return res.status(400).json("Invalid id.");
        if(!await Movie.findByPk(id)) return res.status(404).json("Movie not found.");

        await moviesService.deleteMovieById(id);
        return res.status(201).json({ status : 1 });
    } catch (error) {
        return res.status(500).json(error);
    }
}
exports.update = async (req, res, next) => {
    try {
        let id = Number(req.params.id);
        if(isNaN(id)) return res.status(400).json("Invalid id.");
        if(!await Movie.findByPk(id)) return res.status(404).json("Movie not found.");
        try {
            moviesService.validateMovieDtoForUpdate(req.body);
        } catch(ex){
            return res.status(400).json(ex);
        }

        await moviesService.updateMovieById(id, req.body)
        const movie = await moviesService.getMovieById(id)
        return res.status(201).json({ data : movie, status : 1 });
    } catch (error) {
        return res.status(500).json(error);
    }
}
exports.show = async (req, res, next) => {
    try {
        let id = Number(req.params.id);
        if(isNaN(id)) return res.status(400).json("Invalid id.");
        if(!await Movie.findByPk(id)) return res.status(404).json("Movie not found.")

        const movie = await moviesService.getMovieById(id)
        return res.status(201).json({ data: movie, status : 1 });
    } catch (error) {
        return res.status(500).json(error);
    }
}
exports.list = async (req, res, next) => {
    try {
        try {
            moviesService.validateQueryParamsForList(req.query)
        } catch (ex) {
            return res.status(400).json(ex);
        }
        const movies = await moviesService.listMovies(req.query.actor, req.query.title, 
            req.query.search, req.query.sort, req.query.order, Number(req.query.limit), Number(req.query.offset))
        return res.status(201).json({ data : movies, status : 1 });
    } catch (error) {
        return res.status(500).json(error);
    }
}
exports.import = async (req, res, next) => {

    try {
        let txt = req.files.movies.data.toString('utf8');
        let jsonMovies = []

        try {
            jsonMovies = moviesService.convertTxtMoviesFileToJson(txt)
            moviesService.validateMultipleMovies(jsonMovies)
        } catch(ex){
            return res.status(400).json(ex)
        }

        const movies = await moviesService.createMultipleMovies(jsonMovies)
        return res.status(201).json(
            { 
                data: movies,
                meta: { imported: movies.length, total: jsonMovies.length }, 
                status : 1 
            }
        )
    } catch (error) {
        return res.status(500).json(error);
    }
}