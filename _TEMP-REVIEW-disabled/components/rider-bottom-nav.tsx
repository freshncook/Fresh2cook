"use client";

import Link from "next/link";

export default function RiderBottomNav(){

 return(

  <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-3 flex justify-around">

   <Link href="/rider/home">
    Home
   </Link>

   <Link href="/rider/my-tasks">
    Tasks
   </Link>

   <Link href="/rider/active-delivery">
    Delivery
   </Link>

   <Link href="/rider/earnings">
    Earnings
   </Link>

   <Link href="/rider/profile">
    Profile
   </Link>

  </div>

 );

}




