"use client";

import RiderHeader from "@/components/rider/header";
import RiderNav from "@/components/rider/nav";

export default function Page(){

 return(

  <div className="p-6 pb-24">

   <RiderHeader />

   <h1 className="text-3xl font-bold mt-6 mb-6">
    Rider Dashboard
   </h1>

   <div className="grid md:grid-cols-2 gap-4">

    <div className="bg-white p-6 rounded-xl shadow">
     ? Today's Earnings
    </div>

    <div className="bg-white p-6 rounded-xl shadow">
     Today's Deliveries
    </div>

    <div className="bg-white p-6 rounded-xl shadow">
     Active Orders
    </div>

    <div className="bg-white p-6 rounded-xl shadow">
     Performance Score
    </div>

   </div>

   <RiderNav />

  </div>

 );

}





