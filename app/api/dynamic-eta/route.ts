import { NextResponse } from "next/server";

export async function GET(){

 return NextResponse.json({
  success:true,
  etaMinutes:12,
  distanceKm:3.8,
  trafficStatus:"Normal"
 });

}





