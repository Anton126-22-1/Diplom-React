const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({

  movieId: {
    type: String,
    ref: "Movie",
    required: true,
  },

  date: {
    type: String,
    required: true,
  },

  time: {
    type: String,
    required: true,
  },

  hall: {
    type: String,
    default: "Hall 1",
  },

  price: {
    type: Number,
    default: 150,
  },

});

module.exports =
  mongoose.model(
    "Session",
    sessionSchema
  );