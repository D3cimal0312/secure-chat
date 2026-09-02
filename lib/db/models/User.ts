import { Schema, model, models } from "mongoose";
import mongoose from "mongoose";
export interface IUser {
    _id: mongoose.Types.ObjectId;
    username: string;
    email: string;
    publicKey?: string;
    passwordHash: string;
    createdAt: Date;
}


const UserSchema = new Schema<IUser>({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 50,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email"],
    },
    publicKey: {
        type: String,
        default: null
        // Public key is false because it is not required at the time of registration, it will be set after the user logs in for the first time
        // generate Diffie-Hellman keypair later through browser so wont be available at the time of registration

    },
    passwordHash: {
        type: String,
        required: true,
        select: false,
    },
},
    { timestamps: true }
)

const User = models.User || model<IUser>("User", UserSchema);

export default User;


