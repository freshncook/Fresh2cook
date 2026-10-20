import { NextResponse } from "next/server";

export async function GET(){

 return NextResponse.json({
  success:true,
  segments:{
   vip:34,
   active:126,
   atRisk:22,
   newCustomers:57
  }
 });

}





