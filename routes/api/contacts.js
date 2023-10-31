import express from "express";
import Joi from "joi";
import mongoose from "mongoose";
import Contact from "../../models/contact.js";
import authenticateToken from "../authenticateToken.js";
const router = express.Router();
const contactSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  favorite: Joi.boolean(),
});

export const updateStatusContact = async (contactId, favorite) => {
  try {
    const updatedContact = await Contact.findByIdAndUpdate(
      contactId,
      { favorite },
      { new: true }
    );

    return updatedContact;
  } catch (error) {
    return null;
  }
};

router.patch("/:contactId/favorite", async (req, res, next) => {
  const { contactId } = req.params;
  const { favorite } = req.body;

  if (
    favorite === undefined ||
    (typeof favorite !== "boolean" &&
      favorite !== "true" &&
      favorite !== "false")
  ) {
    return res.status(400).json({ message: "Invalid favorite value" });
  }

  try {
    const updatedContact = await Contact.findByIdAndUpdate(
      contactId,
      { favorite },
      { new: true }
    );

    if (!updatedContact) {
      return res.status(404).json({ message: "Not found" });
    }

    res.status(200).json(updatedContact);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});
router.get("/", authenticateToken, async (req, res, next) => {
  try {
    const result = await Contact.find({ owner: req.user._id });
    res.json(result);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
});
router.get("/:contactId", async (req, res, next) => {
  try {
    const { contactId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(contactId)) {
      return res.status(404).json({
        message: "Not found",
      });
    }

    const result = await Contact.findById(contactId);

    res.json(result);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
});

router.post("/", async (req, res, next) => {
  const body = req.body;

  delete body.id;

  const { error } = contactSchema.validate(body);

  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
    });
  }

  const result = await Contact.create(body);

  if (!result) {
    return res.status(500).json({
      message: "Server error",
    });
  }

  res.status(201).json(result);
});

router.delete("/:contactId", async (req, res, next) => {
  const { contactId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(contactId)) {
    return res.status(400).json({
      message: "Invalid contactId format",
    });
  }

  try {
    const result = await Contact.findByIdAndRemove(contactId);

    if (!result) {
      return res.status(404).json({
        message: "Not found",
      });
    }

    res.status(200).json({
      message: "Contact deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
});

router.put("/:contactId", async (req, res, next) => {
  const { contactId } = req.params;
  const body = req.body;

  delete body.id;

  const { error } = contactSchema.validate(body);

  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
    });
  }

  const result = await Contact.findByIdAndUpdate(contactId, body, {
    new: true,
  });

  if (!result) {
    return res.status(404).json({
      message: "Contact not found",
    });
  }

  res.status(200).json(result);
});
export default router;
