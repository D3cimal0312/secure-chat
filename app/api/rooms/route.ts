import { NextRequest,NextResponse } from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth";
import connectDB from "@/lib/db/mongoose";
import Room from "@/lib/db/models/Room";
import User from "@/lib/db/models/User";

// getting all rooms that participents is a memeber of

export async function GET(){
    try{
        const session=await getServerSession(authOptions)

        if(!session){
            return NextResponse.json({error:"Unauthorized"},{status:401})
        }

        await connectDB()
        const rooms=await Room.find({participants:session.user.id})
        .populate("participants","username email")
        .populate("createdBy","username")
        .sort({updatedAt:-1})

        return NextResponse.json({rooms})
        
    }catch(error){
        console.log(error)
        return NextResponse.json({error:"Internal server error"},{status:500})
    }
}


// CREATING A NEW ROOM WITH THE CURRENT USERS AND THE PLUS PARTICIPANTS

export async function POST(req:NextRequest)
{
    try{
        const session =await getServerSession(authOptions);
        if(!session){
            return NextResponse.json({error:"Unauthorized"},{status:401})
        }

        const {name,participants}=await req.json()
        if (!name || !participants || !Array.isArray(participants)) {
        return NextResponse.json({ error: "name and participants are required" }, { status: 400 });
    }

    // merge creater into participents
      const allParticipants = [...new Set([session.user.id, ...participants])];

    if (allParticipants.length < 2) {
        return NextResponse.json({ error: "At least 2 participants required" }, { status: 400 });
    }
    await connectDB();

    // validate that the requestd participants ic actually exist
    const existingCount = await User.countDocuments({
        _id:{$in:allParticipants},
    });
    if(existingCount !== allParticipants.length){
        return NextResponse.json(
            {error:"One or more participants do not exisits"},
        {status:400}
        );
    }

    const room =await Room.create({
        name,
        participants,
        createdBy:session.user.id
    });

    return NextResponse.json({room},{status:201});
        
    }
    catch(error){
        console.log(error);
        return NextResponse.json({error:"Internal server error"},{status:500})
    }
}