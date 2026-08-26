import jwt from "jsonwebtoken";
import User, { UserDocument } from "../models/User.js";

function getJWTSecret() {
  return process.env.JWT_SECRET || "fallback_secret";
}

function getJWTExpiresIn(): jwt.SignOptions["expiresIn"] {
  return (process.env.JWT_EXPIRES_IN || "7d") as jwt.SignOptions["expiresIn"];
}

function generateToken(user: UserDocument): string {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    getJWTSecret(),
    { expiresIn: getJWTExpiresIn() }
  );
}

export async function register(
  name: string,
  email: string,
  password: string,
  role: string = "user"
) {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new Error("Email already registered");
  }

  const user = await User.create({ name, email, password, role });
  const token = generateToken(user);

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      carbonFootprint: user.carbonFootprint,
    },
  };
}

export async function login(email: string, password: string) {
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  const token = generateToken(user);

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      carbonFootprint: user.carbonFootprint,
    },
  };
}

export async function getProfile(userId: string) {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    carbonFootprint: user.carbonFootprint,
    createdAt: user.createdAt,
  };
}

export async function updateProfile(
  userId: string,
  updates: Partial<{ name: string; avatar: string }>
) {
  const user = await User.findByIdAndUpdate(userId, updates, {
    new: true,
    runValidators: true,
  });
  if (!user) throw new Error("User not found");
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
  };
}
