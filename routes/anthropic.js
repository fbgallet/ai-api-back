const Anthropic = require("@anthropic-ai/sdk");
const express = require("express");
const cors = require("cors");
const router = express.Router();
router.use(express.json());
router.use(cors()); // { origin: "roamresearch.com" }
const requestNb = 0;

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
  requestNb++;
  try {
    const { key, prompt, context, model, temperature } = req.body;
    if (!key && !process.env.ANTHROPIC_API_KEY) {
      res.status(400).json({ message: "Valid API key needed." });
      return;
    }
    if (!prompt.length) {
      res.status(400).json({ message: "Prompt needed !" });
      return;
    }
    const anthropic = anthropicAPI(key || process.env.ANTHROPIC_API_KEY);
    const message = await anthropic.messages.create({
      max_tokens: 4096, // maximum for Claude 3 models
      system: context,
      messages:
        typeof prompt === "string"
          ? [{ role: "user", content: prompt }]
          : prompt,
      model: model || "claude-3-haiku-20240307",
      temperature: temperature !== null ? temperature : 1.0,
    });
    // Anthropic models: https://docs.anthropic.com/claude/docs/models-overview#model-recommendations
    // Claude 3 Opus : claude-3-opus-20240229
    // Claude 3 Sonnet	: claude-3-sonnet-20240229
    // Claude 3.5 Sonnet	: claude-3-5-sonnet-20240620
    // Claude 3 Haiku :	claude-3-haiku-20240307
    console.log(
      `Request n°${requestNb}\nModel: ${message.model}\nTokens: in=${message.usage.input_tokens} out=${message.usage.input_tokens}`
    );
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
