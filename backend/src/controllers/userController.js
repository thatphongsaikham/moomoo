import User from "../models/User.js";

export const getAll = async (req, res) => {
  try {
    const users = User.getAll();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const create = async (req, res) => {
  try {
    const user = User.create(req.body);
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
