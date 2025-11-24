import multer from "multer";

// Multer configuration
// can  disk storage
const storage = multer.memoryStorage();

export const upload = multer({ storage });