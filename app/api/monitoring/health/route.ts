import { NextResponse } from "next/server";

export async function GET(){

 return NextResponse.json({
  success:true,
  status:"Healthy",
  uptime:"Running",
  database:"Connected"
 });

}





