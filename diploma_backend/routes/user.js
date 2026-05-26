const router = require("express").Router();
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");


// ADD TO FAVORITES
router.post("/favorite/:movieId", authMiddleware, async (req, res) => {
  try {
    await User.findByIdAndUpdate(
      req.user.id,
      { $addToSet: { favorites: req.params.movieId } }
    );

    res.json({ message: "Added to favorites" });

  } catch (err) {
    console.log("ADD FAVORITE ERROR:", err);
    res.status(500).json({ message: "Error adding favorite" });
  }
});


// REMOVE FROM FAVORITES
router.delete("/favorite/:movieId", authMiddleware, async (req, res) => {
  try {
    await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { favorites: req.params.movieId } }
    );

    res.json({ message: "Removed from favorites" });

  } catch (err) {
    console.log("REMOVE FAVORITE ERROR:", err);
    res.status(500).json({ message: "Error removing favorite" });
  }
});

module.exports = router;