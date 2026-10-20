import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success:true,
    decisions:[
      "Increase riders in busy zones",
      "Reward top performers",
      "Reassign delayed orders",
      "Reduce idle time",
      "Monitor SLA daily"
    ]
  });
}





