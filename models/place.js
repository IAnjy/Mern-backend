const mongoose = require ('mongoose');

const User = require('../models/user');

// const User = new userSchema;
const Schema = mongoose.Schema;

// const userSchema = new Schema ({
//   name: { type: String, required: true },
//   email: { type: String, required: true, unique: true},
//   password: { type: String, required: true, minlength: 6},
//   image: { type: String, required: true },
//   // places : [ placeSchema ]
//   places : [{ type: mongoose.Types.ObjectId, required: true, ref: 'Place' }]
// });

const placeSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  address: { type: String, required: true },
  location : {
    lat : {type: Number, required: true},
    lng : {type: Number, required: true}
  },
  // creator: { userSchema }
  // creator: { type: mongoose.SchemaType, required: true, ref: 'User' }
  creator: { type: mongoose.Types.ObjectId, required: true, ref: 'User' }
});

module.exports = mongoose.model('Place', placeSchema);