import { NextResponse } from "next/server";

export async function GET(){

 return NextResponse.json({
  success:true,
  carts:[
   {
    customer:"Rahul",
    value:450,
    ageHours:4
   },
   {
    customer:"Amit",
    value:320,
    ageHours:7
   }
  ]
 });

}





