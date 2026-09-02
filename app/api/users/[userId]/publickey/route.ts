import {NextRequest,NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth";
import connectDB from "@/lib/db/mongoose";
import User from "@/lib/db/models/User";




// @get request — returning users public key
export async function GET(
    req:NextRequest,
    {params}: {
        params:Promise<{userId:string}>
    }){
    try {
        const session=await getServerSession(authOptions)

        if(!session){
            return NextResponse.json({error:"Unauthorized"},{status:401})
        }

        const{userId}=await params

        await connectDB()
        const user =await User.findById(userId).select("publicKey")

        if(!user){
            return NextResponse.json({error:"User not found"},{status:404})
        }
        
        return NextResponse.json({publicKey:user.publicKey})
        
    } catch (error) {
        console.log(error)
        return NextResponse.json({error:"Internal server error"},{status:500})
    }
    


}

// put request 

export async function PUT(req:NextRequest,{params}:{
    params:Promise<{userId:string}>
}){

    try{
        const session=await getServerSession(authOptions)

        if(!session){
            return NextResponse.json({error:"Unauthorized"},{status:401})
        }

        const {userId}=await params

        if(session.user.id !== userId){
            return NextResponse.json({error:"Forbidden"},{status:403})
        }

        const {publicKey}=await req.json()

        if(!publicKey || typeof publicKey !== "string"){
            return NextResponse.json({error:"Public key is required"},{status:400})
        }

        await connectDB()
        await User.findByIdAndUpdate(userId,{publicKey})

        return NextResponse.json({success:true})


    }catch(error){
        console.log(error)
        return NextResponse.json({error:"Internal server error"},{status:500})
    }
    

    
}