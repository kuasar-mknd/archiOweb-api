import User from '../models/userModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Enregistrement d'un nouvel utilisateur
export const registerUser = async (req, res) => {
  try {
    // Vérifiez si l'utilisateur existe déjà
    const userExists = await User.findOne({ identifier: req.body.identifier });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Créez un nouvel utilisateur avec le modèle User
    const user = new User(req.body);
    await user.save();

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Authentification de l'utilisateur
export const loginUser = async (req, res) => {
  try {
    const user = await User.findOne({ identifier: req.body.identifier });
    if (user && await user.comparePassword(req.body.password)) {
      // Créer un token JWT
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '1h' } // ou une autre durée selon vos besoins
      );

      res.json({ message: 'Auth successful', token });
    } else {
      res.status(401).json({ message: 'Auth failed' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Récupération des informations de l'utilisateur par ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mise à jour des informations de l'utilisateur
export const updateUser = async (req, res) => {
  try {
    // Ne laissez pas l'utilisateur mettre à jour directement son mot de passe ici
    delete req.body.password;

    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Suppression d'un utilisateur
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(204).json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
