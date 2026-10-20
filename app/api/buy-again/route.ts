import { NextResponse } from "next/server";

export async function GET(){

 return NextResponse.json({
  success:true,
  products:[
   "Onion 500g",
   "Tomato 500g",
   "Potato 1kg",
   "Bhindi 500g"
  ]
 });

}





