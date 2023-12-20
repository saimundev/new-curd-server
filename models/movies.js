import mongoose, { Mongoose } from "mongoose";

const moviesSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  poster: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    require: true,
  },
  director: {
    type: Array,
    required: true,
  },
  writers: {
    type: Array,
    required: true,
  },
  actors: {
    type: Array,
    required: true,
  },
  trailer_video_link: {
    type: String,
    require: true,
  },
  image1: {
    type: String,
    require: true,
  },
  image2: {
    type: String,
    require: true,
  },
  reviews: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Rating",
    },
  ],
});

const MoviesModel = mongoose.model("Movie", moviesSchema);

export default MoviesModel;
