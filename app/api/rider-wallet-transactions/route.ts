import { NextResponse } from "next/server";

export async function GET(){

 return NextResponse.json({
  success:true,
  transactions:[
   {
    id:1,
    type:"Delivery Income",
    amount:250
   },
   {
    id:2,
    type:"Bonus",
    amount:100
   }
  ]
 });

}





