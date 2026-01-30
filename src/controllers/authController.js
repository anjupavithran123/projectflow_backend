import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { supabase } from "../lib/supabase.js";

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields required" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from("users")
      .insert([{ name, email, password: hashedPassword }])
      .select()
      .single();

    if (error) return res.status(400).json({ message: error.message });

    const token = generateToken(data);

    res.status(201).json({
      user: { id: data.id, name: data.name, email: data.email },
      token,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single();
  
      if (error || !user)
        return res.status(401).json({ message: "Invalid credentials" });
  
      const isMatch = await bcrypt.compare(password, user.password);
  
      if (!isMatch)
        return res.status(401).json({ message: "Invalid credentials" });
  
      const token = generateToken(user);
  
      res.json({
        user: { id: user.id, name: user.name, email: user.email },
        token,
      });
    } catch (err) {
      console.error("Login error:", err);
      res.status(500).json({ message: "Server error" });
    }
  };
  