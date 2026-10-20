import { NextResponse } from "next/server";

export async function GET(){

 return NextResponse.json({
  success:true,
  currentShift:"Morning",
  startTime:"08:00 AM",
  endTime:"05:00 PM"
 });

}





