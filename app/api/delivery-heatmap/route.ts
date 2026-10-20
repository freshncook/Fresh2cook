import { NextResponse } from "next/server";

export async function GET(){

 return NextResponse.json({
  success:true,
  zones:[
   { zone:"Dwarka 1", orders:22 },
   { zone:"Dwarka 2", orders:14 },
   { zone:"Dwarka 3", orders:31 },
   { zone:"Dwarka 4", orders:18 }
  ]
 });

}





