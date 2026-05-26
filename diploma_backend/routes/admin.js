const router = require("express").Router();

const User = require("../models/User");
const Movie = require("../models/Movie");
const Booking = require("../models/Booking");
const Slide = require("../models/Slide");

const auth =
  require("../middleware/authMiddleware");

const role =
  require("../middleware/roleMiddleware");


// ================= STATS =================

router.get(
  "/stats",
  auth,
  role,
  async (req, res) => {

    try {

      const users =
        await User.countDocuments();

      const movies =
        await Movie.countDocuments();

      const bookings =
        await Booking.countDocuments();

      const slides =
        await Slide.countDocuments();

      res.json({
        users,
        movies,
        bookings,
        slides,
      });

    } catch (err) {

      console.log(err);

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);


// ================= GET USERS =================

router.get(
  "/users",
  auth,
  role,
  async (req, res) => {

    try {

      const users =
        await User.find()
          .select("-password")
          .populate("favorites");

      res.json(users);

    } catch (err) {

      console.log(err);

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);


// ================= DELETE USER =================

router.delete(
  "/users/:id",
  auth,
  role,
  async (req, res) => {

    try {

      await User.findByIdAndDelete(
        req.params.id
      );

      res.json({
        message: "User deleted",
      });

    } catch (err) {

      console.log(err);

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);

// ================= USER GROWTH =================
router.get("/user-growth", async (req, res) => {
  const data = await User.aggregate([
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$createdAt",
          },
        },
        users: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json(data);
});

module.exports = router;