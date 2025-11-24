import Router from "express";
import { register, login, getMyDetails, adminRegister, handleRefreshToken } from "../controller/authController";
import { authenticate } from "../middleware/authMiddleware";
import { isAdmin } from "../middleware/isAdminMiddleware";

const router = Router();

// Public routes (anyone can access)
router.post("/register", register);
router.post("/login", login);
router.post("/refresh",handleRefreshToken)

// Protected routes (USER, AUTHOR, ADMIN)
router.get("/me", authenticate, getMyDetails);

// Protected ( ADMIN only )
router.post("/admin/register", authenticate, isAdmin, adminRegister);

export default router;