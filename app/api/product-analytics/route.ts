import { NextResponse } from "next/server";

export async function GET(){

 return NextResponse.json({
  success:true,
  topProducts:[
   "Onion",
   "Tomato",
   "Potato",
   "Bhindi",
   "Capsicum"
  ]
 });

}





