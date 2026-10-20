import { NextResponse } from "next/server";

export async function GET() {

 return NextResponse.json({
  success:true,
  rider:{
   id:"R001",
   name:"Demo Rider",
   latitude:28.5921,
   longitude:77.0460,
   status:"On Delivery"
  }
 });

}





