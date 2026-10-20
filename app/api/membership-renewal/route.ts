import { NextResponse } from "next/server";

export async function GET(){

 return NextResponse.json({
  success:true,
  expiringMembers:14,
  renewedMembers:62,
  renewalRate:81
 });

}





