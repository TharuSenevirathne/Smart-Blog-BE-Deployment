 import mongoose, { Document, Schema } from "mongoose"

export enum Role {
  ADMIN = "admin",
  USER =   "user",
  AUTHOR = "author"
}

export enum Status {
    PENDING = "PENDING",
    APPROVED =  "APPROVED",
    REJECTED ="REJECTED"
}

export interface IUSER extends Document {
  _id: mongoose.Types.ObjectId
  firstName: string
  lastName:  string
  email:     string
  password:  string
  roles: Role[]
  approved: Status
}

const userSchema = new Schema<IUSER>({
  firstName: { 
    type: String, 
    required: true 
},
  lastName: { 
    type: String, 
    required: true 
},
  email: { 
    type: String, 
    required: true, 
    unique: true 
},
  password: { 
    type: String,
     required: true
     },
  roles: [{
     type: String,
      enum: Role,
       default: [Role.USER] 
    }],
  approved: { 
    type: String, 
    enum: Object.values(Status), 
    default: Status.PENDING
 }
})

export const User = mongoose.model<IUSER>("User", userSchema) // methana thina "User" wa thamai postModel.ts eke mehema dunne =ref : "User"
