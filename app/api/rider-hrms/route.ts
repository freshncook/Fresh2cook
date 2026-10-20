import { NextResponse } from "next/server";

export async function GET() {

 return NextResponse.json({
  success:true,
  modules:[
   "Attendance",
   "Shifts",
   "Payroll",
   "Incentives",
   "Documents"
  ]
 });

}





