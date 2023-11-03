import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import "dotenv/config";
import gravatar from "gravatar";
import multer from "multer";
import jimp from "jimp";
import path from "path";
import fs from "fs/promises";
import authenticateToken from "../authenticateToken.js";
const authRouter = express.Router();
import { userSignUpShema, userSigningShema } from "../../models/users.js";
import User from "../../models/users.js";

authRouter.post("/register", async (req, res) => {
  const { error } = userSignUpShema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { email, password } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(409).json({ message: "Email in use" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const avatarURL = gravatar.url(email, { s: "250", r: "pg", d: "mm" });

  const user = new User({
    email,
    password: hashedPassword,
    avatar: avatarURL,
  });
  await user.save();
  res.status(201).json({
    user: {
      email: user.email,
      subscription: user.subscription,
      avatar: user.avatar,
    },
  });
});

authRouter.post("/login", async (req, res) => {
  const { error } = userSigningShema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Email or password is wrong" });
  }
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "23h",
  });
  user.token = token;
  await user.save();
  res.json({
    token,
    user: {
      email: user.email,
      subscription: user.subscription,
    },
  });
});

authRouter.post("/logout", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    user.token = null;
    await user.save();

    res.status(204).send();
  } catch (error) {
    res.status(401).json({ message: "Not authorized" });
  }
});

authRouter.get("/current", authenticateToken, (req, res) => {
  res.status(200).json({
    email: req.user.email,
    subscription: req.user.subscription,
  });
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "tmp");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

authRouter.patch(
  "/avatars",
  authenticateToken,
  upload.single("avatar"),
  async (req, res) => {
    try {
      const user = req.user;
      const filePath = req.file.path;
      const image = await jimp.read(filePath);
      await image.resize(250, 250).writeAsync(filePath);

      const newFileName = `${user._id}${path.extname(req.file.originalname)}`;
      const newFilePath = `public/avatars/${newFileName}`;

      await fs.rename(filePath, newFilePath);

      const avatarURL = `/avatars/${newFileName}`;
      user.avatarURL = avatarURL;
      await user.save();

      res.status(200).json({ avatarURL });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

export default authRouter;
