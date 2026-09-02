import { Schema, model, models } from "mongoose";
import mongoose from "mongoose";
import { IUser } from "./User";
import { IRoom } from "./Rooms";

// 
export interface IMessage {
    _id: mongoose.Types.ObjectId;
    room: mongoose.Types.ObjectId | IRoom;
    sender: mongoose.Types.ObjectId | IUser;
    ciphertext: string;
    iv: string;
    createdAt: Date;
    updatedAt: Date;
}

// iv initialization vector is used to encrypt the message wihtout it decryption is not possible


const MessageSchema = new mongoose.Schema<IMessage>(
    {
        room: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Room",
            required: true,
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        ciphertext: {
            type: String,
            required: true,
        },
        iv: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
)

const Message = models.Message || model<IMessage>("Message", MessageSchema);

export default Message;