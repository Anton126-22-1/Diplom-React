const router = require("express").Router();

const Slide = require("../models/Slide");

// ================= GET =================

router.get("/", async (req, res) => {

  try {

    const slides = await Slide.find();

    res.json(slides);

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Server error",
    });
  }
});

// ================= CREATE =================

router.post("/", async (req, res) => {

  try {

    const { title, image } = req.body;

    const slide = new Slide({
      title,
      image,
    });

    await slide.save();

    res.status(201).json(slide);

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Server error",
    });
  }
});

// ================= DELETE =================

router.delete("/:id", async (req, res) => {

  try {

    await Slide.findByIdAndDelete(
      req.params.id
    );

    res.json({
      message: "Slide deleted",
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Server error",
    });
  }
});

module.exports = router;