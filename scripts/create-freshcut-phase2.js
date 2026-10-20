const fs = require("fs");
const path = require("path");

const files = {
  "app/api/referral/register/route.ts": `
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    success: true,
    message: "Referral Registered"
  });
}
`,

  "app/api/wallet/credit/route.ts": `
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    success: true,
    credited: true
  });
}
`,

  "app/api/order-otp/route.ts": `
import { NextResponse } from "next/server";

export async function POST() {
  const otp = Math.floor(
    1000 + Math.random() * 9000
  );

  return NextResponse.json({
    success: true,
    otp
  });
}
`,

  "app/api/auto-rider-assign/route.ts": `
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    success: true,
    assigned: true
  });
}
`,

  "app/api/reassign-rider/route.ts": `
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    success: true,
    reassigned: true
  });
}
`,

  "app/admin/backend-team/page.tsx": `
export default function Page() {
  return (
    <div className="p-10">
      Backend Processing Dashboard
    </div>
  );
}
`,

  "app/admin/delivery-manager/page.tsx": `
export default function Page() {
  return (
    <div className="p-10">
      Delivery Manager Dashboard
    </div>
  );
}
`,

  "app/admin/rider-dashboard/page.tsx": `
export default function Page() {
  return (
    <div className="p-10">
      Rider Dashboard
    </div>
  );
}
`
};

for (const [filePath, content] of Object.entries(files)) {
  const fullPath = path.join(process.cwd(), filePath);

  fs.mkdirSync(
    path.dirname(fullPath),
    { recursive: true }
  );

  fs.writeFileSync(
    fullPath,
    content.trim()
  );

  console.log("Created:", filePath);
}

console.log("PHASE 2 COMPLETE");
