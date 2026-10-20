import { NextResponse } from "next/server";

export async function GET() {

 return NextResponse.json({
  success:true,
  routes:[
   {
    zone:"Dwarka Sector 7",
    priority:"High"
   },
   {
    zone:"Dwarka Sector 10",
    priority:"Medium"
   }
  ]
 });

}





