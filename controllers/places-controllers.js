const uuid = require('uuid');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const HttpError = require('../models/http-error');
const getCoordsForAddress = require('../util/location');

const Place = require('../models/place');
const User = require('../models/user');

// let DUMMY_PLACES = [
//     {
//         id: 'p1',
//         title:'Empire State Building',
//         description : 'One of the most famous sky scrapers in the world',
//         location:{
//             lat: 40.7484474,
//             lng: -73.9871516
//         },
//         address: '20 W 34th St, New York, NY 1001',
//         creator: 'u1'
//     }
// ];

const getPlaceById = async (req, res, next) => {
    const placeId = req.params.pid;
    // console.log(placeId);

    let place;
    try{
        place = await Place.findById( placeId );
    }catch(err){
        const error = new HttpError('something went wrong, could not find a place.', 500);
        return next(error);
    }
    
    // console.log(place);
    if (!place) {
        const error =  new HttpError('Could not find a place for the provided id', 404);
        return next(error);
    }

    // console.log(place);
    res.json({ place: place.toObject({ getters: true }) });
};

const getPlacesbyUserId = async (req, res, next) =>{
    const userId = req.params.uid;

    // let places;
    let userWithPlaces;
    try{
        userWithPlaces = await User.findById(userId).populate('places');
    }catch(err){
        const error = new httpError('Fetching places failed, please try again later', 500);
        return next(error);
    }

    // console.log(userWithPlaces);
    // if (!places || places.length === 0)
    if (!userWithPlaces || userWithPlaces.places.length === 0) {
        return next(new HttpError('Could not find  places for the provided user id', 404)) ;
    }
    res.json({ places: userWithPlaces.places.map(place => place.toObject({ getters: true })) });
};

const createPlace = async (req,res, next ) => {
    const errors = validationResult(req);
   // console.log(errors);
    if(!errors.isEmpty()){
       return( next( new HttpError("Invalid inputs passed, please check your data", 422)) );
    }

    // console.log("tsisy erreur");
    
    const {title, description , address, creator} = req.body;
    
    let coordinates;  
    try{
        coordinates = await getCoordsForAddress(address);
    } catch (error){
        return next(error);
    }
    
    // console.log("azo le coordonées");
    
    const createdPlace = new Place({
        title,
        description,
        address,
        location : coordinates,
        image: '/image/paris.jpg', // ajouter l'url
        creator
    });
    
    let user; // variable ampiasana anle user model
    try{
        user = await User.findById(creator);
    } catch(err){
        const error = new HttpError('Creatingg place failed, please try again', 500);
        return next(error);
    }
    
    // console.log(createdPlace);
    // console.log(createdPlace._id);
    

    if(!user){
        const error = new HttpError('Could not find user for provided id.', 404);
        return next(error);
    }

    try{
        // DUMMY_PLACES.push(createdPlace);
        
        // const sess = await mongoose.startSession();
        // sess.startTransaction();
        // await createdPlace.save({ session: sess });
        // user.places.push( createdPlace );
        // await user.save({ session: sess });
        // await sess.commitTransaction();
        
        // createdPlace.creator.push(user.id);
        // user.places.push(Place);
        
        // console.log(createPlace.id);
        user.places.push( createdPlace._id );
        await user.save();
        await createdPlace.save();


    } catch(err) {
        const error = new HttpError(
            'Creatinggg place failed, please try again.',
            500
        );
        return next(error);
    }

    res.status(201).json({place: createdPlace});
};

const updatePlace = async (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return next( new HttpError("Ivalid inputs passed, please check your data", 422));
    }

    const {title, description} = req.body;
    const placeId = req.params.pid;

    // const updatedPlace = { ...DUMMY_PLACES.find(p => p.id === placeId) };
    // const placeIndex = DUMMY_PLACES.findIndex(p => p.id === placeId) ;
    
    let place;
    try{
        place = await Place.findById(placeId);
    } catch (err){
        const error = new HttpError('Something went wrong, could not update place.', 500);
        return next(error);
    }

    place.title = title;
    place.description = description;

    // DUMMY_PLACES[placeIndex] = updatedPlace;

    try{
        await place.save();
    }catch (err){
        const error = new httpError('Something went wrong, could not update place', 500);
        return next(error);
    }

    res.status(200).json({ place: place.toObject({ getters: true }) });

};

const deletePlace = async (req, res, next) => {
    const placeId = req.params.pid;
    
    // if(!DUMMY_PLACES.find(p => p.id === placeId)){
    //     throw new HttpError("could not find a place for that id.", 404);
    // }

    let place;
    try{
        place = await Place.findById(placeId).populate('creator'); // manakambana document ny populate raha efa misy relation any amn schema : "Ref"
    } catch(err){
        const error = new HttpError('Someting went wrong, could not delete place.', 500);
        return next(error);
    }

    // DUMMY_PLACES = DUMMY_PLACES.filter(p => p.id !== placeId);
    if(!place) {
        const error = new HttpError('could not find place for this id.', 404);
        return next(404);
    }

    // console.log(place);

    try{
        // const sess = await mongoose.startSession();
        // sess.startTransaction();
        // await place.remove({ session: sess });
        // place.creator.places.pull(place);
        // await place.creator.save({ session: sess });
        // await sess.commitTransaction();

        await place.remove();
        place.creator.places.pull(place);
        await place.creator.save();

    }catch(err){
        const error = new HttpError('Someting went wrong, could not delete place.', 500);
        return next(error);
    }


    res.status(200).json({message: 'Deleted Place.'});
};

exports.getPlaceById = getPlaceById;
exports.getPlacesbyUserId = getPlacesbyUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;


