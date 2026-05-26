const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema({
  title: String,
  description: String,
  poster: String,
  year: String,

  releaseDate: String,
  country: String,
  duration: String,
  ageRestriction: String,

  genres: [String],

  ratings: {
    imdb: Number,
    rottenTomatoes: Number
  },

  trailerLink: String
});

module.exports = mongoose.model("Movie", movieSchema);