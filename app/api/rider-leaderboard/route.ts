import { NextResponse } from "next/server";

export async function GET(){

 return NextResponse.json({
  success:true,
  riders:[
   {
    rank:1,
    name:"Rider 1",
    deliveries:145
   },
   {
    rank:2,
    name:"Rider 2",
    deliveries:132
   }
  ]
 });

}





