const Anthropic = require("@anthropic-ai/sdk");
const express = require("express");
const router = express.Router();
router.use(express.json());
router.use(cors({ origin: "roamresearch.com" }));

router.post("/anthropic/initialize", (req, res) => {
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

router.post("/anthropic/message", async (req, res) => {
  /* cors({ corsOptions }), */
  try {
    // res.header("Access-Control-Allow-Origin", "roamresearch.com");
    // res.header(
    //   "Access-Control-Allow-Headers",
    //   "Origin, X-Requested-With, Content-Type, Accept"
    // );
    // console.log("req post:", req);
    const { key, content, model } = req.body;
    if (!key || !content) {
      res.status(400).json({ message: "Valid API key & content are needed." });
      return;
    }
    const anthropic = anthropicAPI(key);
    const message = await anthropic.messages.create({
      max_tokens: 1024,
      messages: [{ role: "user", content }],
      model: model || "claude-3-haiku-20240307",
    });
    // Anthropic models: https://docs.anthropic.com/claude/docs/models-overview#model-recommendations
    // Claude 3 Opus : claude-3-opus-20240229
    // Claude 3 Sonnet	: claude-3-sonnet-20240229
    // Claude 3 Haiku :	claude-3-haiku-20240307
    console.log(message.content);
    res.status(200).json({ response: message.content[0].text });
  } catch (error) {
    res.status(500).json({ message: error.response });
  }
});

function anthropicAPI(key) {
  return new Anthropic({
    apiKey: key,
  });
}
