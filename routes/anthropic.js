const Anthropic = require("@anthropic-ai/sdk");
const express = require("express");
const cors = require("cors");
const router = express.Router();
router.use(express.json());
router.use(cors()); // { origin: "roamresearch.com" }

router.post("/anthropic/initialize", (req, res) => {
  try {
    const { key } = req.body;
    const anthropic = new Anthropic({
      apiKey: key,
    });
    res.status(200).json(anthropic);
  } catch (error) {
    res.status(500).json({ message: error.response });
  }
});

router.post("/anthropic/message", async (req, res) => {
  try {
    const { key, prompt, context, model } = req.body;
    if (!key || !prompt) {
      res.status(400).json({ message: "Valid API key & prompt are needed." });
      return;
    }
    const anthropic = anthropicAPI(key);
    const message = await anthropic.messages.create({
      max_tokens: 4096, // maximum for Claude 3 models
      system: context,
      messages: [{ role: "user", content: prompt }],
      model: model || "claude-3-haiku-20240307",
    });
    // Anthropic models: https://docs.anthropic.com/claude/docs/models-overview#model-recommendations
    // Claude 3 Opus : claude-3-opus-20240229
    // Claude 3 Sonnet	: claude-3-sonnet-20240229
    // Claude 3 Haiku :	claude-3-haiku-20240307
    res.status(200).json({ response: message });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({
      message: error.message,
    });
  }
});

function anthropicAPI(key) {
  return new Anthropic({
    apiKey: key,
  });
}

module.exports = router;
