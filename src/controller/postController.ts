import { Request, Response } from "express";
import cloudinary from "../configuration/cloudinary";
import { Post } from "../model/postModel";
import { AuthRequest } from "../middleware/authMiddleware";

// Create a new post
export const createPost = async (req: AuthRequest, res: Response) => {
  try {
    const { title, content, tags } = req.body;
    let imgURL = "";

    if (req.file) {
      const result: any = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "posts" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file?.buffer);
      });

      imgURL = result.secure_url;
    }

    const newPost = new Post({
      title,
      content,
      tags: tags.split(","),
      imgURL,
      author: req.user.sub,
    });

    const post = await newPost.save();
    res.status(200).json({ message: "Post created", data: post });
  } catch (err: any) {
    console.error("Cloudinary upload error:", err);
    res.status(500).json({ message: err?.message });
  }
};

// Get posts created by the logged-in user (with pagination)
export const getMyPosts = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Find posts for this user, sorted by newest first
    const posts = await Post.find({ author: req.user.sub })
      .sort({ createdAt: -1 }) // sort by createdAt in descending order
      .limit(limit) // limit to 10
      .skip(skip) // skip the first 10
      .populate("author", "email"); // only select these fields

    const total = await Post.countDocuments({ author: req.user.sub });

    res.status(200).json({
      data: posts,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalPosts: total
    });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error?.message });
  }
};

// Get all posts
export const viewAll = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find() // fetch all posts
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate("author", "email"); // optional

    const total = await Post.countDocuments();

    res.status(200).json({
      data: posts,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalPosts: total
    });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error?.message });
  }
};
