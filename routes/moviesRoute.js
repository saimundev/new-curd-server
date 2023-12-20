import express from "express";
import {
  createMovie,
  createWatchList,
  getMovie,
  getMovies,
  getRatingMovie,
  getWatchList,
  ratingMovie,
  removeWatchList,
} from "../controllers/moviesController.js";

const router = express.Router();

router.post("/create-movie", createMovie);
router.get("/get-movies", getMovies);
router.get("/get-movie/:movieId", getMovie);
router.post("/watch-list", createWatchList);
router.get("/getWatch-list/:userId", getWatchList);
router.delete("/remove-watchList/:listId", removeWatchList);
router.post("/rating", ratingMovie);
router.get("/get-rating", getRatingMovie);

export default router;
