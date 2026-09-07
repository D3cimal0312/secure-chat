import { Schema, model, models } from "mongoose";
import mongoose from "mongoose";
import { IUser } from "./User";
import { IRoom } from "./Room";

export interface IEnvelope {
    recipientId: mongoose.Types.ObjectId;
    keyCiphertext: string;
    keyIv: string;
}

export interface IMessage {
    _id: mongoose.Types.ObjectId;
    room: mongoose.Types.ObjectId | IRoom;
    sender: mongoose.Types.ObjectId | IUser;
    body: {
        ciphertext: string;
        iv: string;
    };
    envelopes: IEnvelope[];
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
          body: {
            ciphertext: {
                type: String,
                required: true,
            },
            iv: {
                type: String,
                required: true,
            },
        },
        envelopes: [
            {
                recipientId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    required: true,
                },
                keyCiphertext: {
                    type: String,
                    required: true,
                },
                keyIv: {
                    type: String,
                    required: true,
                },
            },
        ],
    },
    { timestamps: true }
)
MessageSchema.index({ room: 1, createdAt: 1 })

const Message = models.Message || model<IMessage>("Message", MessageSchema);

export default Message;