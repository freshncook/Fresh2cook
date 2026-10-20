
const { createServer } = require("http");
const next = require("next");
const { parse } = require("url");

const port = Number(process.env.PORT) || 3000;
const dev = process.env.NODE_ENV !== "production";

const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(port, "0.0.0.0", (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
