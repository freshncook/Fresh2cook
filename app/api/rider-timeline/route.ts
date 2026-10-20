import { NextResponse } from "next/server";

export async function GET(){

 return NextResponse.json({
  success:true,
  timeline:[
   {
    step:"Order Assigned",
    status:"Completed"
   },
   {
    step:"Accepted",
    status:"Pending"
   },
   {
    step:"Picked Up",
    status:"Pending"
   },
   {
    step:"Delivered",
    status:"Pending"
   }
  ]
 });

}





