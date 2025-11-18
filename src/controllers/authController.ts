import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { LoginDto, RegisterDto, AuthResponse } from "../types";

// Mock users database (replace with actual database)
const users: any[] = [];

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { name, email, password }: RegisterDto = req.body;

      // Check if user exists
      const existingUser = users.find((u) => u.email === email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password: hashedPassword,
      };
      users.push(newUser);

      // Generate token
      const token = jwt.sign(
        { id: newUser.id, email: newUser.email },
        config.JWT_SECRET,
        { expiresIn: config.JWT_EXPIRES_IN } as jwt.SignOptions
      );

      const response: AuthResponse = {
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
        },
      };

      return res.status(201).json(response);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password }: LoginDto = req.body;

      // Find user
      const user = users.find((u) => u.email === email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate token
      const token = jwt.sign(
        { id: user.id, email: user.email },
        config.JWT_SECRET,
        { expiresIn: config.JWT_EXPIRES_IN } as jwt.SignOptions
      );

      const response: AuthResponse = {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      };

      return res.status(200).json(response);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  }
}
