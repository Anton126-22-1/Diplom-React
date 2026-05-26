const router = require("express").Router();

const mongoose = require("mongoose");

const Session =
  require("../models/Session");


// ================= GET ALL SESSIONS =================

router.get("/", async (req, res) => {

  try {

    const sessions =
      await Session.find({});

    res.json(sessions);

  } catch (err) {

    console.error(
      "Error fetching sessions:",
      err
    );

    res.status(500).json({
      message:
        "Error fetching sessions",
    });
  }
});


// ================= GET MOVIE SESSIONS =================

router.get("/:movieId", async (req, res) => {
  try {
    const { movieId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      return res.json([]);
    }

    const sessions = await Session.find({
      movieId: new mongoose.Types.ObjectId(movieId),
    });

    console.log("FOUND SESSIONS:", sessions);

    res.json(sessions);

  } catch (err) {
    console.error("Error fetching movie sessions:", err);

    res.status(500).json({
      message: "Error fetching sessions",
    });
  }
});


// ================= CREATE SESSION =================

router.post("/", async (req, res) => {

  try {

    const {
      movieId,
      date,
      time,
      hall,
      price,
    } = req.body;

    // validation

    if (
      !movieId ||
      !date ||
      !time
    ) {

      return res.status(400).json({
        message:
          "movieId, date and time are required",
      });
    }

    // create session

    const session =
      new Session({

        movieId:
          new mongoose.Types.ObjectId(
            movieId
          ),

        date,

        time,

        hall:
          hall || "Hall 1",

        // NEW PRICE
        price:
          Number(price) || 150,
      });

    await session.save();

    res.status(201).json(
      session
    );

  } catch (err) {

    console.error(
      "Error creating session:",
      err
    );

    res.status(500).json({
      message:
        "Error creating session",
    });
  }
});


// ================= DELETE SESSION =================

router.delete("/:id", async (req, res) => {

  try {

    await Session.findByIdAndDelete(
      req.params.id
    );

    res.json({
      message:
        "Session deleted",
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message:
        "Server error",
    });
  }
});

// ================= UPDATE SESSION =================

router.put("/:id", async (req, res) => {

  try {

    const {
      movieId,
      date,
      time,
      hall,
      price,
    } = req.body;

    const updatedSession =
      await Session.findByIdAndUpdate(

        req.params.id,

        {
          movieId:
            new mongoose.Types.ObjectId(
              movieId
            ),

          date,

          time,

          hall,

          price:
            Number(price) || 150,
        },

        {
          new: true,
        }
      );

    if (!updatedSession) {

      return res.status(404).json({
        message:
          "Session not found",
      });
    }

    res.json(updatedSession);

  } catch (err) {

    console.error(
      "Update session error:",
      err
    );

    res.status(500).json({
      message:
        "Error updating session",
    });
  }
});

module.exports = router;