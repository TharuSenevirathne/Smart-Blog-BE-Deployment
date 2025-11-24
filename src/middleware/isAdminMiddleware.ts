import { Response, NextFunction } from "express";
import { AuthRequest } from "./authMiddleware";
import { Role } from "../model/userModel";

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  // Check if JWT verified user exists
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Check if user has ADMIN role
  if (!req.user.roles.includes(Role.ADMIN)) {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }

  next();
};
