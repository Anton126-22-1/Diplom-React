const mongoose = require("mongoose");

const slideSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },

  image: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model(
  "Slide",
  slideSchema
);