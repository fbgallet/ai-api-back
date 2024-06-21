require("dotenv").config();
const express = require("express");
const app = express();
app.use(express.json({ limit: "1000kb" })); // largely enought for 200 000 tokens (approx. 600 kb)
// app.use(cors({ origin: "roamresearch.com" }));

const anthropicRoutes = require("./routes/anthropic");
// const ollamaRoutes = require("./routes/ollama");
app.use(anthropicRoutes);
// app.use(ollamaRoutes);

// Welcome Route
app.get("/", (req, res) => {
  try {
    res.status(200).json({
      message: "Welcome on ai-api server for Live AI Assistant extension 👋",
    });
  } catch (error) {
    res.status(500).json({ message: error.response });
  }
});

// All other routes
app.all("*", (req, res) => {
  res.status(404).json({ message: "This route does not exist ⛔" });
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server started ✅");
});
