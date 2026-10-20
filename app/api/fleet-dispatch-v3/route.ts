import { NextResponse } from "next/server";

export async function GET(){

 return NextResponse.json({
  success:true,
  dispatchMode:"AUTO",
  aiDecision:"Nearest Available Rider",
  confidence:96
 });

}





