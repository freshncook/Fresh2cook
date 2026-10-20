import { NextResponse } from "next/server";

export async function GET(){

 return NextResponse.json({
  success:true,
  combos:[
   {
    title:"Sabzi Combo",
    items:["Onion","Tomato","Potato"]
   },
   {
    title:"Bharta Combo",
    items:["Baingan","Tomato","Onion"]
   }
  ]
 });

}





