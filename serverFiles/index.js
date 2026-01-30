const { ping } = require("keepalive-server");
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cron = require("node-cron");
const archiver = require("archiver");
const rateLimit = require("express-rate-limit");
const RateLimitRedisStore = require("rate-limit-redis").default;
const Redis = require("ioredis");
const redisClient = new Redis(process.env.REDIS_URL);
const FRONTEND_URL = "https://zypher24.vercel.app";

ping(300000, "https://zypher24.vercel.app"); //every 5 mins

const app = express();
app.set("trust proxy", 1);
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: `${FRONTEND_URL}`,
    credentials: true,
  })
);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const { incrementUploadCounter, getUploadCounter } = require("./redis");
let uploadCount = 0;

(async () => {
  uploadCount = await getUploadCounter();
})();

const fileStore = new Map();
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

function generateCode(length = 4) {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += Math.floor(Math.random() * 10);
  }
  return code.padStart(length, "0");
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const name = `${Date.now()}_${file.originalname}`;
    cb(null, name);
  },
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 },
});

const limiter = rateLimit({
  store: new RateLimitRedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
  windowMs: 1 * 60 * 1000,
  max: 10,
  message: "Too many requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.get("/", (req, res) => {
  res.send("Zypher backend running.");
});

app.post(
  "/upload",
  upload.array("files"),
  express.json(),
  express.urlencoded({ extended: true }),
  async (req, res) => {
    let code;
    do {
      code = generateCode(4);
    } while (fileStore.has(code));
    const expiry = Date.now() + 10 * 60 * 1000;

    if (req.body.text) {
      fileStore.set(code, {
        type: "text",
        text: req.body.text,
        expiry,
      });
      uploadCount = await incrementUploadCounter();
      return res.status(200).json({
        code,
        link: `${FRONTEND_URL}/retrieve/${code}`,
        type: "text",
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No file or text provided." });
    }

    if (req.files.length === 1) {
      const file = req.files[0];
      fileStore.set(code, {
        type: "file",
        filename: file.originalname,
        filepath: file.path,
        expiry,
      });
      uploadCount = await incrementUploadCounter();
      return res.status(200).json({
        code,
        link: `${FRONTEND_URL}/retrieve/${code}`,
        filename: file.originalname,
        type: "file",
      });
    } else {
      const zipFilename = `${code}-zypher-files.zip`;
      const zipPath = path.join(uploadDir, zipFilename);

      const output = fs.createWriteStream(zipPath);
      const archive = archiver("zip", { zlib: { level: 9 } });

      archive.pipe(output);

      req.files.forEach((file) => {
        archive.file(file.path, { name: file.originalname });
      });

      await archive.finalize();

      fileStore.set(code, {
        type: "zip",
        filename: zipFilename,
        originalFilenames: req.files.map((f) => f.originalname),
        filepath: zipPath,
        expiry,
      });

      uploadCount = await incrementUploadCounter();
      req.files.forEach((file) => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });

      return res.status(200).json({
        code,
        link: `${FRONTEND_URL}/retrieve/${code}`,
        filename: zipFilename,
        type: "zip",
      });
    }
  }
);

app.get("/api/file/:code", (req, res) => {
  const { code } = req.params;
  const entry = fileStore.get(code);

  if (!entry) {
    return res.status(404).json({ error: "Invalid or expired code." });
  }

  if (entry.expiry < Date.now()) {
    fileStore.delete(code);
    return res.status(410).json({ error: "Code has expired." });
  }

  if (entry.type === "text") {
    return res.json({
      type: "text",
      text: entry.text,
    });
  }

  if (entry.type === "file") {
    return res.json({
      type: "file",
      filename: entry.filename,
    });
  }

  if (entry.type === "zip") {
    return res.json({
      type: "zip",
      filename: entry.filename,
      originalFilenames: entry.originalFilenames,
    });
  }
});

app.get("/api/download/:code", (req, res) => {
  const { code } = req.params;
  const entry = fileStore.get(code);

  if (!entry || (entry.type !== "file" && entry.type !== "zip")) {
    return res.status(404).send("Invalid or expired code.");
  }

  if (entry.expiry < Date.now()) {
    fileStore.delete(code);
    return res.status(410).send("File expired.");
  }
  return res.download(entry.filepath, entry.filename);
});

app.get("/api/stats", async (req, res) => {
  const count = await getUploadCounter();
  res.json({ uploadCount: count });
});

cron.schedule("* * * * *", () => {
  const now = Date.now();
  for (const [code, entry] of fileStore.entries()) {
    if (entry.expiry < now) {
      if (
        (entry.type === "file" || entry.type === "zip") &&
        fs.existsSync(entry.filepath)
      ) {
        fs.unlinkSync(entry.filepath);
      }
      fileStore.delete(code);
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
});
