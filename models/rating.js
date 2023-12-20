import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema({
  rating: {
    type: Number,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  movieId: {
    type: String,
    required: true,
  },
});

const RatingModel = mongoose.model("Rating", ratingSchema);

export default RatingModel;
