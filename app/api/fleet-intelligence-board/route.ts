import { NextResponse } from "next/server";

export async function GET() {

  return NextResponse.json({
    success:true,
    insights:[
      "Top rider performance detected",
      "Zone balancing recommended",
      "High demand period expected",
      "Monitor SLA compliance"
    ]
  });

}





