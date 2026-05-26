const router = require("express").Router();
const Booking = require("../models/Booking");
const Session = require("../models/Session");
const auth = require("../middleware/authMiddleware");


// ================= GET ALL (ADMIN ONLY) =================
router.get("/", auth, async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const bookings = await Booking.find()
      .populate("movieId")
      .populate("sessionId")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    console.error("GET ALL ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// ================= GET MY BOOKINGS =================
router.get("/my", auth, async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const bookings = await Booking.find({ userId: req.user.id })
      .populate("movieId")
      .populate("sessionId")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    console.error("GET MY ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// ================= CREATE BOOKING =================
router.post("/", auth, async (req, res) => {
  try {
    const { movieId, sessionId, userName, userPhone, seats } = req.body;

    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!seats || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({ message: "Seats required" });
    }

    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (!session.price) {
      return res.status(500).json({ message: "Session price missing" });
    }

    const booking = new Booking({
      userId: req.user.id,
      movieId,
      sessionId,
      userName,
      userPhone,
      seats,
      pricePerSeat: session.price,
      totalPrice: session.price * seats.length,
    });

    await booking.save();

    res.status(201).json(booking);
  } catch (err) {
    console.error("CREATE ERROR:", err);
    res.status(500).json({ message: "Booking error" });
  }
});


// ================= UPDATE BOOKING =================
router.put("/:id", auth, async (req, res) => {
  try {
    const { userName, userPhone, seats } = req.body;

    if (!seats || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({ message: "Invalid seats" });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Not found" });
    }

    const isOwner =
      booking.userId && booking.userId.toString() === req.user.id;

    const isAdmin = req.user?.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const session = await Session.findById(booking.sessionId);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (!session.price) {
      return res.status(500).json({ message: "Session price missing" });
    }

    booking.userName = userName;
    booking.userPhone = userPhone;
    booking.seats = seats;

    booking.pricePerSeat = session.price;
    booking.totalPrice = session.price * seats.length;

    await booking.save();

    res.json(booking);
  } catch (err) {
    console.error("UPDATE ERROR:", err);
    res.status(500).json({ message: "Update error" });
  }
});


// ================= CANCEL BOOKING =================
router.put("/:id/cancel", auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Not found" });
    }

    const isOwner =
      booking.userId && booking.userId.toString() === req.user.id;

    const isAdmin = req.user?.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Forbidden" });
    }

    booking.status = "cancelled";

    await booking.save();

    res.json(booking);
  } catch (err) {
    console.error("CANCEL ERROR:", err);
    res.status(500).json({ message: "Cancel error" });
  }
});


// ================= DELETE BOOKING =================
router.delete("/:id", auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Not found" });
    }

    const isOwner =
      booking.userId && booking.userId.toString() === req.user.id;

    const isAdmin = req.user?.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await Booking.findByIdAndDelete(req.params.id);

    res.json({ message: "Deleted" });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ message: "Delete error" });
  }
});

router.get("/revenue", auth, async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const result = await Booking.aggregate([
      {
        $match: { status: "confirmed" },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalPrice" },
        },
      },
    ]);

    const revenue = result.length ? result[0].total : 0;

    res.json({ revenue });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;