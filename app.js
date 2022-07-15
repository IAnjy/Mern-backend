const express = require('express');
const bodyParser = require('body-parser');

const mongoose = require('mongoose');

const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes')
const HttpError = require('./models/http-error');

const app = express();

app.use(bodyParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
    next();

});

app.use('/api/places', placesRoutes);

app.use('/api/users', usersRoutes);

app.use((req, res, next) => {
    const error = new HttpError('Could not find this route', 404);
    throw error;
});

// app.use((error,req,res,next) => {
//     if (res.headerSent){
//         return next(error);
//     }
//     res.status(error.code || 500);
//     res.json({message: error.message || 'Une erreur inconnue tonga tao'});
// });

app.use((err, req, res, next) => {
    res.locals.error = err;
    const status = err.status || 500;
    res.status(status);
    res.render('error');
  });


mongoose
    .connect('mongodb://localhost:27017/mern?readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false')
    // .connect('mongodb://localhost:27017/places?readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false')
    .then(()=>{
        app.listen(5000);
    })
    .catch(err => {
        console.log(err);
    });
