import { NextResponse } from "next/server";

export async function GET() {

 return NextResponse.json({
  success:true,
  cpu:"Normal",
  memory:"Healthy",
  database:"Connected",
  api:"Running"
 });

}





