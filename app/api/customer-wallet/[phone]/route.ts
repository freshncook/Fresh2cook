import { NextResponse } from "next/server";

export async function GET(){

 return NextResponse.json({
  success:true,
  membership:"VIP Gold",
  freeDelivery:true,
  cashbackRate:"5%"
 });

}



