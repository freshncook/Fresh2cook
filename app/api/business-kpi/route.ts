import { NextResponse } from "next/server";

export async function GET(){

 return NextResponse.json({
  success:true,
  revenue:425000,
  expenses:286000,
  profit:139000,
  margin:32.7
 });

}





