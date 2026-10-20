import { NextResponse } from "next/server";

export async function GET(){

 return NextResponse.json({
  success:true,
  averageETA:"18 Minutes",
  fastestETA:"8 Minutes",
  slowestETA:"32 Minutes"
 });

}





