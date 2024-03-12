require("dotenv").config();
const cors = require("cors");
// const axios = require("axios");
const express = require("express");
const Anthropic = require("@anthropic-ai/sdk");
const app = express();
app.use(express.json());
app.use(cors());

const corsOptions = {
  origin: "https://roamresearch.com",
  // optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

// const myPathRoutes = require("./routes/myPath");
// app.use(myMathRoutes);

function anthropicAPI(key) {
  return new Anthropic({
    apiKey: key,
  });
}

// Welcome Route
app.post("/", (req, res) => {
  try {
    const { key } = req.body;
    const anthropic = new Anthropic({
      apiKey: key,
    });
    // console.log(anthropic);
    res.status(200).json(anthropic);
  } catch (error) {
    res.status(500).json({ message: error.response });
  }
});

app.post(
  "/message",
  /*cors({ corsOptions }),*/ async (req, res) => {
    try {
      res.header("Access-Control-Allow-Origin", "roamresearch.com");
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
      );
      const { key, content } = req.body;
      if (!key || !content) {
        res
          .status(400)
          .json({ message: "Valid API key & content are needed." });
        return;
      }
      const anthropic = anthropicAPI(key);
      const message = await anthropic.messages.create({
        max_tokens: 1024,
        messages: [{ role: "user", content }],
        model: "claude-3-opus-20240229",
      });
      console.log(message.content);
      res.status(200).json({ response: message.content[0].text });
    } catch (error) {
      res.status(500).json({ message: error.response });
    }
  }
);

// All other routes
app.all("*", (req, res) => {
  res.status(404).json({ message: "This route does not exist ⛔" });
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server started ✅");
});
