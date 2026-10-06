const express = require("express");
const path = require("path");
const { nanoid } = require("nanoid");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const urlMap = new Map();

// Serve homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Shorten URL endpoint
app.post("/shorten", (req, res) => {
  const { url } = req.body;

  // Validate URL
  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  // Ensure URL has protocol
  let validUrl = url;
  if (!validUrl.startsWith("http://") && !validUrl.startsWith("https://")) {
    validUrl = "https://" + validUrl;
  }

  // Generate unique short code
  let shortCode = nanoid(6);
  while (urlMap.has(shortCode)) {
    shortCode = nanoid(6);
  }

  // Store mapping
  urlMap.set(shortCode, validUrl);

  // Return short URL
  const shortUrl = `${req.protocol}://${req.get("host")}/${shortCode}`;
  res.json({ shortUrl, shortCode, originalUrl: validUrl });
});

// Redirect route - handles short links
app.get("/:code", (req, res) => {
  const { code } = req.params;
  
  // Prevent common false positives
  if (code === "favicon.ico" || code === "robots.txt" || code.includes(".")) {
    return res.status(404).send("Not found");
  }

  const target = urlMap.get(code);

  if (!target) {
    return res.status(404).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Link Not Found</title>
        <style>
          body { font-family: Arial; text-align: center; padding: 50px; background: #f3f6fb; }
          .container { background: white; padding: 30px; border-radius: 10px; max-width: 500px; margin: 0 auto; }
          h1 { color: #dc3545; }
          a { color: #667eea; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>❌ Link Not Found</h1>
          <p>This short link doesn't exist or has expired.</p>
          <a href="/">← Create a new short link</a>
        </div>
      </body>
      </html>
    `);
  }

  // Direct redirect (no ads, no intermediary)
  res.redirect(301, target);
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log(`📝 To shorten a link, visit http://localhost:${PORT}`);
});
