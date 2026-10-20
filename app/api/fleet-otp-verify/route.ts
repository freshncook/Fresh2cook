import { NextResponse } from "next/server";

export async function POST(
 request:Request
){

 const body =
  await request.json();

 const valid =
  String(body.otp || "").length > 0;

 return NextResponse.json({
  success:valid,
  verified:valid
 });

}





