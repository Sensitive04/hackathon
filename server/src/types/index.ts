import { Request } from "express";

export interface IUser {
  name: string;
  email: string;
  password: string;
  role: "user" | "admin" | "recycler";
  avatar?: string;
  carbonFootprint: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    email: string;
  };
}
