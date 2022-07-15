const { validationResult } = require('express-validator');
const uuid = require ('uuid');

const HttpError =  require('../models/http-error') ;

const User = require('../models/user');

// const DUMMY_USERS = [
//   {
//     id: 'u1',
//     name: 'Ianjy Martial',
//     email: 'ianjymartial@gmail.com',
//     password: 'testers',
//   }
// ];

const getUsers = async (req, res, next) => {
  let users;
  try{
    users = await User.find({}, '-password');
  }catch(err){
    const error = new HttpError('Fetching users failde, please try again later.', 500);
    return next(error);
  }

  res.json({users: users.map(user => user.toObject({ getters: true }))});

};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return next( new HttpError("Invalid inputs passed, please check your data", 422) );
  }    
  const { name, email, password } = req.body;

  // const hasUser = DUMMY_USERS.find(u =>u.email === email);
  // if (hasUser) {
  //   throw new HttpError('Could not create user, email already exist.', 422);
  // }
  let existingUser;
  try{
    existingUser = await User.findOne({ email: email });
  }catch(err){
    const error = new HttpError('signing up failed, please try again later', 500);
    return next(error);
  }
  
  if(existingUser){
    const error = new HttpError('User exists already, please login instead', 422);  
    return next(error);
  }

  const createdUser = new User({
    name,
    email,
    image: 'image/ianjy.jpg',
    password, 
    places: []
  });
  
  // DUMMY_USERS.push(createdUser);
  try{
    await createdUser.save();
  } catch(err) {
      const error = new HttpError(
        'Signing up failed, please try again.',
        500
      );
      return next(error);
  }

  res.status(201).json({user: createdUser.toObject({ getters: true })});
};

const login = async (req, res, next) => {
  const {email, password} = req.body;
  
  let existingUser;
  try{
    existingUser = await User.findOne({ email: email });
    if (!existingUser) {
      const error = new HttpError('logging in failed, please try again later', 500);
      return next(error);
    }
  } catch (err) {
    const error = new HttpError('logging in failed, please try again later', 500);
    return next(error);
  }

  // console.log(existingUser, existingUser.email, existingUser.password, password);
  // console.log(existingUser.email !== email);

  if(!existingUser || existingUser.password !== password) {
  // if(existingUser.password !== password) {
    const error = new HttpError('invalid credentials, could not log you in.', 401);
    return next(error);
  }

  res.json({
    message: 'logged in!',
    user: existingUser.toObject({getters: true})
  })


};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login =login;