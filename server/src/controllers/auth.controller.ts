import { Request, Response } from "express";
import { IAuthRequest } from "../types/index.js";
import * as authService from "../services/auth.service.js";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;
    const result = await authService.register(name, email, password, role);
    res.status(201).json(result);
  } catch (error: any) {
    if (error.message === "Email already registered") {
      res.status(409).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Registration failed" });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json(result);
  } catch (error: any) {
    if (error.message === "Invalid credentials") {
      res.status(401).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Login failed" });
  }
};

export const getProfile = async (
  req: IAuthRequest,
  res: Response
): Promise<void> => {
  try {
    const profile = await authService.getProfile(req.user!.id);
    res.json(profile);
  } catch {
    res.status(404).json({ error: "User not found" });
  }
};

export const updateProfile = async (
  req: IAuthRequest,
  res: Response
): Promise<void> => {
  try {
    const profile = await authService.updateProfile(req.user!.id, req.body);
    res.json(profile);
  } catch {
    res.status(400).json({ error: "Update failed" });
  }
};
