import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    module: "RBAC Permissions",
    timestamp: new Date().toISOString()
  });
}





