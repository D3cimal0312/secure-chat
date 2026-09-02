//  container for messages between participents
// both groups and dms are same model

import mongoose from "mongoose";
import { Schema, model, models } from "mongoose";
import { IUser } from "./User";

export interface IRoom {
    _id: mongoose.Types.ObjectId;
    name: string;
    participants: mongoose.Types.ObjectId[] | IUser[];
    createdBy: mongoose.Types.ObjectId | IUser;
    createdAt: Date;
    updatedAt: Date;
}


const RoomSchema = new mongoose.Schema<IRoom>({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    participants: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        required: true,
        validate: {
            validator: (v: mongoose.Types.ObjectId[]) => v.length >= 3,
            message: "Room must have at least 3 participants",
        },
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
},
    { timestamps: true }
)

// indexed participants so mongodb can query faster for user populated rooms

RoomSchema.index({ participants: 1 })

const Room = models.Room || model<IRoom>("Room", RoomSchema);

export default Room;