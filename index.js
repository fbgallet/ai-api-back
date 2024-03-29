require("dotenv").config();
// const cors = require("cors");
// const axios = require("axios");
const express = require("express");
const app = express();
app.use(express.json());
// app.use(cors({ origin: "roamresearch.com" }));

// const corsOptions = {
//   origin: "roamresearch.com",
//   // optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
// };

const anthropicRoutes = require("./routes/anthropic");
app.use(anthropicRoutes);

// Welcome Route
app.get("/", (req, res) => {
  try {
    res
      .status(200)
      .json({ message: "Welcome on ai-api server for my RR extensions 👋" });
  } catch (error) {
    res.status(500).json({ message: error.response });
  }
});

// All other routes
app.all("*", (req, res) => {
  res.status(404).json({ message: "This route does not exist ⛔" });
});

app.listen(process.env.PORT, () => {
  console.log("Server started ✅");
});
