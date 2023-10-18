import express from "express";
import Joi from "joi";
import * as contactsServices from "../../models/contacts.js";

const router = express.Router();
const contactSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
});

router.get("/", async (req, res, next) => {
  const result = await contactsServices.listContacts();
  res.json(result);
});

router.get("/:contactId", async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const result = await contactsServices.getContactById(contactId);

    if (!result) {
      return res.status(404).json({
        message: "Not found",
      });
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
});

router.post("/", async (req, res, next) => {
  const body = req.body;

  if (body.id) {
    return res.status(400).json({
      message: '"id" is not allowed',
    });
  }

  const { error } = contactSchema.validate(body);

  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
    });
  }

  const result = await contactsServices.addContact(body);

  if (!result) {
    return res.status(500).json({
      message: "Server error",
    });
  }

  res.status(201).json(result);
});

router.delete("/:contactId", async (req, res, next) => {
  const { contactId } = req.params;
  const result = await contactsServices.removeContact(contactId);

  if (!result) {
    return res.status(404).json({
      message: "Not found",
    });
  }

  res.status(200).json({
    message: "contact deleted",
  });
});

router.put("/:contactId", async (req, res, next) => {
  const { contactId } = req.params;
  const body = req.body;

  if (body.id) {
    return res.status(400).json({
      message: '"id" is not allowed',
    });
  }

  const { error } = contactSchema.validate(body);

  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
    });
  }

  const result = await contactsServices.updateContact(contactId, body);

  if (!result) {
    return res.status(404).json({
      message: "Contact not found",
    });
  }

  res.status(200).json(result);
});
export default router;
