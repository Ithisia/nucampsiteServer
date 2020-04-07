const express = require('express');
const bodyParser = require('body-parser');
const Favorite = require('../models/favorite');
const User = require('../models/user');
const authenticate = require('../authenticate');
const cors = require('./cors');


const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, (req, res, next) => {
        Favorite.find()
            .then(favorites => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);
            })
            .catch(err => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user })
            .then(favorite => {
                if (favorite) {
                    req.body.forEach(csite => {
                        if (favorite.campsites.indexOf(csite._id) == -1) {
                            console.log('Campsite Added', csite);
                            favorite.campsites.push(csite);
                            favorite.save();
                        } else {
                            console.log('Campsite Already A Favorite', csite);
                        }
                    });
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                } else {
                    newFavorite = new Favorite;
                    newFavorite.user = req.user;
                    newFavorite.campsites = req.body;
                    Favorite.create(newFavorite)
                        .then(favorite => {
                            console.log('Favorite Created ', favorite);
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        })
                        .catch(err => next(err));
                }
            })
            .catch(err => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /favorites');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user })
            .then(favorite => {
                if (favorite) {
                    favorite.delete();
                    res.statusCode = 200;
                    res.end('Favorites deleted');
                }
            })
            .catch(err => next(err));
    });

favoriteRouter.route('/:campsiteId')
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, (req, res, next) => {
        res.statusCode = 403;
        res.end(`Get operation not supported on /favorites/${req.params.campsiteId}`);
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
        Favorite.findOne({ user: req.user })
            .then(favorite => {
                if (favorite) {
                    var theIndex = favorite.campsites.indexOf(req.params.campsiteId);
                    if (theIndex == -1) {
                        console.log('Campsite Added', req.params.campsiteId);
                        favorite.campsites.push(req.params.campsiteId);
                        favorite.save();
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);
                    } else {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.end(`That campsite is already in the list of favorites!`)
                        console.log('Campsite ' + req.params.campsiteId + ' Is Already A Favorite.');
                    }
                } else {
                    newFavorite = new Favorite;
                    newFavorite.user = req.user;
                    newFavorite.campsites = req.params.campsiteId;
                    Favorite.create(newFavorite)
                        .then(favorite => {
                            console.log('Favorite Created ', favorite);
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        })
                        .catch(err => next(err));                
                }
            })
            .catch(err => next(err));        
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end(`PUT operation not supported on /favorites/${req.params.campsiteId}`);
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user })
            .then(favorite => {
                if (favorite) {
                    var theIndex = favorite.campsites.indexOf(req.params.campsiteId);
                    if (theIndex == -1) {
                        console.log('Campsite Not A Favorite', req.params.campsiteId);
                    } else {
                        console.log('Campsite ' + req.params.campsiteId + ' Removed');
                        favorite.campsites.splice(theIndex, 1);
                        favorite.save();
                    }
                }
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            })
            .catch(err => next(err));
    });

module.exports = favoriteRouter;