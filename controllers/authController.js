import bcrypt from 'bcryptjs'; 
import jwt from 'jsonwebtoken'; 
import User from '../models/User.js'; 

const { genSalt, hash, compare } = bcrypt; 
const { sign } = jwt;

export async function signup(req, res) {
  const { name, congregation, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email }); 
    if (existingUser) return res.status(400).json({ msg: 'User already exists' });

    const salt = await genSalt(10);
    const hashedPassword = await hash(password, salt);
    const user = new User({ name, congregation, email, password: hashedPassword });
    await user.save();

    const token = sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
}

export async function login(req, res) {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }); 
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
}
