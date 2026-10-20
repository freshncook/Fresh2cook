"use client";

import { useEffect,useState } from "react";

export default function Page(){

 const [data,setData] =
  useState<any>(null);

 useEffect(()=>{
  fetch("/api/rider-earnings")
   .then(r=>r.json())
   .then(setData);
 },[]);

 const rider =
  data?.riders?.[0];

 return(
  <div className="p-6 max-w-4xl mx-auto">

   <h1 className="text-3xl font-bold mb-6">
    Rider Earnings
   </h1>

   {!rider && (
    <div>Loading...</div>
   )}

   {rider && (

    <div className="grid md:grid-cols-2 gap-4">

     <div className="bg-white p-6 rounded-xl shadow">

      <div className="text-sm">
       Total Earnings
      </div>

      <div className="text-4xl font-bold">
       ?{rider.earnings}
      </div>

     </div>

     <div className="bg-white p-6 rounded-xl shadow">

      <div className="text-sm">
       Deliveries
      </div>

      <div className="text-4xl font-bold">
       {rider.completedDeliveries}
      </div>

     </div>

    </div>

   )}

  </div>
 );
}





