import mongoose, { Document } from "mongoose";

export interface IPOST extends Document {
    //This is TypeScript data types
    id: mongoose.Types.ObjectId,
    title: string,
    content: string,
    tags: string[],
    imgURL: string,
    author: mongoose.Types.ObjectId,
    createdAt: Date,
    updatedAt: Date
}

const postSchema = new mongoose.Schema<IPOST>(
    // This is MongoDB data types
    {
        title: {
            type: String,
            required: true
        },
        content: {
            type: String,
            required: true
        },
        tags: {
            type: [String],
            required: true
        },
        imgURL: {
            type: String,
            required: true
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // This is a reference to the User model / this is a foreign key (user id)
            required: true
        }
    },
    {
        timestamps: true 
    }
);

export const Post = mongoose.model<IPOST>("Post", postSchema);
