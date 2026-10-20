import { NextResponse } from "next/server";

export async function POST(req:Request){

 const body =
  await req.json();

 const lat =
  Number(body.latitude);

 const lng =
  Number(body.longitude);

 let zone =
  "Dwarka Central";

 if(lat > 28.60){
  zone = "Dwarka North";
 }

 if(lat < 28.57){
  zone = "Dwarka South";
 }

 return NextResponse.json({
  success:true,
  zone
 });

}




