const express = require("express");
const path = require("path");
const { nanoid } = require("nanoid");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const urlMap = new Map();

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/shorten", (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  let shortCode = nanoid(6);
  while (urlMap.has(shortCode)) {
    shortCode = nanoid(6);
  }

  urlMap.set(shortCode, url);

  const shortUrl = `${req.protocol}://${req.get("host")}/${shortCode}`;
  res.json({ shortUrl });
});

app.get("/:code", (req, res) => {
  const { code } = req.params;
  const target = urlMap.get(code);

  if (!target) {
    return res.status(404).send("Link not found");
  }

  res.redirect(target);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
