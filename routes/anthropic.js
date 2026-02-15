const Anthropic = require("@anthropic-ai/sdk");
const express = require("express");
const cors = require("cors");
const router = express.Router();
router.use(express.json());
router.use(cors()); // { origin: "roamresearch.com" }
let requestNb = 0;

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
      model: model || "claude-haiku-4-5-20251001",
      temperature: temperature !== null ? temperature : 1.0,
    });
    console.log(
      `Request n°${requestNb}\nModel: ${message.model}\nTokens: in=${message.usage.input_tokens} out=${message.usage.output_tokens}`,
    );
    res.status(200).json({ response: message });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({
      message: error.message,
    });
  }
});

// Proxy for Anthropic Files API download (bypasses CORS restriction on GET endpoints)
router.get("/anthropic/files/:fileId/content", async (req, res) => {
  requestNb++;
  try {
    const apiKey = req.headers["x-api-key"];
    if (!apiKey && !process.env.ANTHROPIC_API_KEY) {
      res.status(400).json({ message: "Valid API key needed." });
      return;
    }

    const { fileId } = req.params;
    console.log(`Request n°${requestNb} - Files API download: ${fileId}`);

    const response = await fetch(
      `https://api.anthropic.com/v1/files/${fileId}/content`,
      {
        method: "GET",
        headers: {
          "x-api-key": apiKey || process.env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-beta": "files-api-2025-04-14",
        },
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`Files API error: ${response.status} - ${errorText}`);
      res.status(response.status).json({ message: errorText });
      return;
    }

    // Stream the binary PDF content back to the client
    res.setHeader(
      "Content-Type",
      response.headers.get("content-type") || "application/pdf",
    );
    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.log("Files API proxy error:", error.message);
    res.status(500).json({ message: error.message });
  }
});

function anthropicAPI(key) {
  return new Anthropic({
    apiKey: key,
  });
}

module.exports = router;
