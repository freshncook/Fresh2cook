import { NextResponse } from "next/server";

export async function GET(){

 return NextResponse.json({
  success:true,
  leaks:[
   "High delivery cost in Zone 3",
   "Low repeat orders in Segment B",
   "Inactive customers above 30 days"
  ]
 });

}





