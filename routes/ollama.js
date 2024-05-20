const express = require("express");
const cors = require("cors");
const router = express.Router();
router.use(express.json());
router.use(cors());

router.post("/ollama/chat", async (req, res) => {
  try {
    const { prompt } = req.body;
    const response = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3",
        messages: [{ role: "user", content: prompt }],
        stream: false,
      }),
    });
    const content = await response.json();
    console.log("content  :>> ", content);

    res.status(200).json({ response: content });
  } catch (error) {
    console.error("error");
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
