import Router from "express";
import { createPost, viewAll, getMyPosts } from "../controller/postController";
import { authenticate } from "../middleware/authMiddleware";
import { requireRole } from "../middleware/roleMiddleware";
import { Role } from "../model/userModel";
import { upload } from "../middleware/upload";

const router = Router();

// ADMIN / AUTHOR
router.post("/create",authenticate,requireRole([Role.AUTHOR,Role.ADMIN]),upload.single("image"),createPost); // postman form data ekak yawaddi eke key eke name eka denne methana image kiyl

router.get("/",viewAll);
// ADMIN / AUTHOR
router.get("/me",authenticate,requireRole([Role.AUTHOR,Role.ADMIN]),getMyPosts)

export default router;