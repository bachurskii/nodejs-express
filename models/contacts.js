import { readFile, writeFile } from "fs/promises";
import path from "path";

const contactsPath = path.resolve("models", "contacts.json");

const updateContacts = (contacts) =>
  writeFile(contactsPath, JSON.stringify(contacts, null, 2));

export const listContacts = async () => {
  const data = await readFile(contactsPath);
  return JSON.parse(data);
};

export const getContactById = async (contactId) => {
  const contacts = await listContacts();
  const result = contacts.find((item) => item.id === contactId);
  return result || null;
};

export const removeContact = async (contactId) => {
  const contacts = await listContacts();
  const index = contacts.findIndex((contact) => contact.id === contactId);
  if (index === -1) {
    return null;
  }
  contacts.splice(index, 1);
  await updateContacts(contacts);
  return "Contact deleted";
};

export const addContact = async (body) => {
  const { name, email, phone } = body;
  if (!name || !email || !phone) {
    return null;
  }
  const contacts = await listContacts();
  const newContact = {
    id: Date.now().toString(),
    name,
    email,
    phone,
  };
  contacts.push(newContact);
  await updateContacts(contacts);

  return newContact;
};

export const updateContact = async (contactId, body) => {
  if (!body) {
    return null;
  }

  const { name, email, phone } = body;

  if (!name && !email && !phone) {
    return null;
  }

  const contacts = await listContacts();
  const index = contacts.findIndex((contact) => contact.id === contactId);

  if (index === -1) {
    return null;
  }

  if (name) contacts[index].name = name;
  if (email) contacts[index].email = email;
  if (phone) contacts[index].phone = phone;

  await updateContacts(contacts);

  return contacts[index];
};
