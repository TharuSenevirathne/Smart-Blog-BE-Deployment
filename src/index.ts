import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import bcrypt from "bcryptjs";
import { User } from "./model/userModel"; 
import postRoutes from "./routes/postRoutes";
import { generateContent } from "./routes/aiRoutes";

const SERVER_PORT = process.env.SERVER_PORT
const MONGO_URL   = process.env.MONGO_URL as string

const app = express();

// Middleware
app.use(express.json())
app.use(cors({
    origin: [ "http://localhost:5173"], //"http://localhost:3000"
    methods: ["GET", "POST", "PUT", "DELETE"]
}));

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/post", postRoutes);
app.use("/api/v1/ai", generateContent)

// Connect to MongoDB
mongoose.connect(MONGO_URL).then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.log(err);
    process.exit(1);
})


// Static Admin Register
app.post("/api/v1/setup-admin", async (req, res) => {
  const existingAdmin = await User.findOne({ roles: "admin" });
  if (existingAdmin) {
    return res.status(400).json({ message: "Admin already exists" });
  }

  const hashedPassword = await bcrypt.hash("1234", 10);
  const admin = new User({
    firstName: "Super",
    lastName: "Admin",
    email: "admin@example.com",
    password: hashedPassword,
    roles: ["admin"],
    approved: "APPROVED"
  });

  await admin.save();
  res.status(201).json({ message: "Admin created successfully!" });
});


app.listen(SERVER_PORT, () => {
  console.log(`Server is running on ${SERVER_PORT}`)
})

export default app;