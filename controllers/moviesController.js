import joi from "joi";
import MoviesModel from "../models/movies.js";
import WatchListModel from "../models/watchList.js";
import RatingModel from "../models/rating.js";

//create movie
export const createMovie = async (req, res) => {
  // validation schema
  const validationSchema = joi.object({
    name: joi.string().min(3).max(100).required().messages(),
    poster: joi.string().required(),
    duration: joi.number().required(),
    description: joi.string().required(),
    director: joi
      .array()
      .min(1)
      .message({ "array.min": "Director can't be empty!" }),
    writers: joi
      .array()
      .min(1)
      .message({ "array.min": "Writers can't be empty!" }),
    actors: joi
      .array()
      .min(1)
      .message({ "array.min": "Actors can't be empty!" }),
    trailer_video_link: joi.string().required(),
    image1: joi.string().required(),
    image2: joi.string().required(),
  });

  // validation error message
  const { error } = validationSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  try {
    await MoviesModel.create(req.body);
    res.status(201).json({ message: "Movie created successful" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// get movies
export const getMovies = async (req, res) => {
  try {
    const movies = await MoviesModel.find({}).populate("reviews");
    res.status(200).json(movies);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// get movie
export const getMovie = async (req, res) => {
  const { movieId } = req.params;
  try {
    const movies = await MoviesModel.findById({ _id: movieId }).populate(
      "reviews"
    );
    res.status(200).json(movies);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

//watch list
export const createWatchList = async (req, res) => {
  try {
    const isExistItem = await WatchListModel.findOne({
      movieId: req.body.movieId,
    });

    if (isExistItem)
      return res.status(400).json({ message: "Already Added Wish List" });
    await WatchListModel.create(req.body);
    res.status(201).json({ message: "Watch list added successful" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

//get watch list
export const getWatchList = async (req, res) => {
  const { userId } = req.params;

  try {
    const watchList = await WatchListModel.find({ userId }).populate("movieId");
    res.status(200).json(watchList);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

//get watch list
export const removeWatchList = async (req, res) => {
  const { listId } = req.params;
  try {
    await WatchListModel.findByIdAndDelete({ _id: listId }, { new: true });
    res.status(200).json({ message: "Watch list remove successful" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

//create rating movie
export const ratingMovie = async (req, res) => {
  try {
    const isExistRating = await RatingModel.findOne({
      movieId: req.body.movieId,
    });

    if (isExistRating)
      return res.status(400).json({ message: "Already Rated" });

    const rating = await RatingModel.create(req.body);
    await MoviesModel.findByIdAndUpdate(
      { _id: req.body.movieId },
      { $push: { reviews: rating._id } }
    );
    res.status(201).json({ message: "Rating added successful" });
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

//get rating movie
export const getRatingMovie = async (req, res) => {
  try {
    const rating = await RatingModel.aggregate({});

    res.status(201).json({ rating });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
