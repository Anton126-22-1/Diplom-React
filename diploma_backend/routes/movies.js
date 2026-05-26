const router = require("express").Router();
const Movie = require("../models/Movie");

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

// ================= GET ALL =================
router.get("/", async (req, res) => {
  try {
    const movies = await Movie.find();

    res.json(movies);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

// ================= GET ONE =================
router.get("/:id", async (req, res) => {
  try {
    const movie = await Movie.findById(
      req.params.id
    );

    if (!movie) {
      return res.status(404).json({
        message: "Movie not found",
      });
    }

    res.json(movie);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

// ================= CREATE =================
router.post(
  "/",
  auth,
  role,
  async (req, res) => {
    try {
      const movie = await Movie.create(
        req.body
      );

      res.status(201).json(movie);
    } catch (err) {
      console.log(err);

      res.status(500).json({
        message: err.message,
      });
    }
  }
);

// ================= UPDATE =================
router.put(
  "/:id",
  auth,
  role,
  async (req, res) => {
    try {
      const movie =
        await Movie.findByIdAndUpdate(
          req.params.id,
          req.body,
          {
            new: true,
          }
        );

      res.json(movie);
    } catch (err) {
      res.status(500).json({
        message: err.message,
      });
    }
  }
);

// ================= DELETE =================
router.delete(
  "/:id",
  auth,
  role,
  async (req, res) => {
    try {
      await Movie.findByIdAndDelete(
        req.params.id
      );

      res.json({
        message: "Movie deleted",
      });
    } catch (err) {
      res.status(500).json({
        message: err.message,
      });
    }
  }
);

module.exports = router;