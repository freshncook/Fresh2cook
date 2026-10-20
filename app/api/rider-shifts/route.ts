import { NextResponse } from "next/server";

export async function GET() {

 return NextResponse.json({
  success:true,
  shifts:[
   {
    shift:"Morning",
    start:"06:00",
    end:"14:00"
   },
   {
    shift:"Evening",
    start:"14:00",
    end:"22:00"
   }
  ]
 });

}





