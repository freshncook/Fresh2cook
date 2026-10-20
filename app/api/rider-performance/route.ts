import { NextResponse } from "next/server";

export async function GET(){

 return NextResponse.json({
  success:true,
  score:92,
  deliveries:125,
  rating:4.8
 });

}





