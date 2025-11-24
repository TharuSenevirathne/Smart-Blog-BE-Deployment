import e, { Request, Response } from "express";
import { IUSER, Role, Status, User } from "../model/userModel"; 
import bcrypt from "bcryptjs";
import { signAccessToken, signRefreshToken } from "../util/token";
import { AuthRequest } from "../middleware/authMiddleware";
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config()

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string

export const register = async (req: Request, res: Response) => {

  try {
    const { firstName, lastName, email, password, role } = req.body

    // data validation
    if (!firstName || !lastName || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" })
    }

    if (role !== Role.USER && role !== Role.AUTHOR) {
      return res.status(400).json({ message: "Invalid role" })
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const approvalStatus =
      role === Role.AUTHOR ? Status.PENDING : Status.APPROVED

    const newUser = new User({
      firstName, // firstName: firstName
      lastName,
      email,
      password: hashedPassword,
      roles: [role],
      approved: approvalStatus
    })

    await newUser.save()

    res.status(201).json({
      message:
        role === Role.AUTHOR
          ? "Author registered successfully. waiting for approvel"
          : "User registered successfully",
      data: {
        id: newUser._id,
        email: newUser.email,
        roles: newUser.roles,
        approved: newUser.approved
      }
    })
  } catch (err: any) {
    res.status(500).json({ message: err?.message })
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    const existingUser = await User.findOne({ email })
    if (!existingUser) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    const valid = await bcrypt.compare(password, existingUser.password)
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    const accessToken = signAccessToken(existingUser)
    const refreshToken = signRefreshToken(existingUser)

    res.status(200).json({
      message: "success",
      data: {
        email: existingUser.email,
        roles: existingUser.roles,
        accessToken,
        refreshToken
      }
    })
  } catch (err: any) {
    res.status(500).json({ message: err?.message })
  }
}


export const getMyDetails = async (req: AuthRequest, res: Response) => {
  
  // const roles = req.user.roles
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  const userId = req.user.sub
  const user =((await User.findById(userId).select("-password")) as IUSER) || null

  if (!user) {
    return res.status(404).json({
      message: "User not found"
    })
  }

  const { firstName, lastName, email, roles, approved } = user

  res.status(200).json({
    message: "Ok",
    data: { firstName, lastName, email, roles, approved }
  })
}


export const adminRegister = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // 1. Validate fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 2. Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create admin user
    const newAdmin = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      roles: [Role.ADMIN],
      approved: Status.APPROVED
    });

    await newAdmin.save();

    // 5. Response
    res.status(201).json({
      message: "Admin registered successfully",
      data: {
        id: newAdmin._id,
        email: newAdmin.email,
        roles: newAdmin.roles,
        approved: newAdmin.approved
      }
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: err.message || "Internal server error" });
  }
};


export const handleRefreshToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    if(!token){
      return res.status(401).json({ message: "No token provided" });
    }

    const payload = jwt.verify(token, JWT_REFRESH_SECRET);
    const user = await User.findById(payload.sub);
    if (!user) {
      return res.status(403).json({ message: "User not found" });
    }
    const accessToken = signAccessToken(user);
    res.status(200).json({ accessToken });

  } catch (err: any) {
    console.error(err);
    res.status(403).json({ message: err.message || "Invalid or expire token" });
  }
};