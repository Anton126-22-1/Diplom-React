require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// 🔥 ROUTES
app.use("/api/auth", require("./routes/auth"));
app.use("/api/movies", require("./routes/movies"));
app.use("/api/sessions", require("./routes/sessions"));
app.use("/api/user", require("./routes/user"));
app.use("/api/slides", require("./routes/slides"));
app.use("/api/bookings", require("./routes/bookings"));
app.use("/api/admin", require("./routes/admin"));

// 🔗 MONGODB ATLAS
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(" DB error:", err));

app.listen(5000, () => console.log(" Server running on 5000"));