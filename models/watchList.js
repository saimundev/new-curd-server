import mongoose from "mongoose";

const watchListSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  movieId: {
    type: mongoose.Types.ObjectId,
    ref: "Movie",
  },
});

const WatchListModel = mongoose.model("WatchList", watchListSchema);

export default WatchListModel;
