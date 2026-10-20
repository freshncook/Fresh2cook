"use client";

import { useEffect,useState } from "react";

export default function Page(){

 const [data,setData] =
  useState<any>(null);

 useEffect(()=>{

  fetch("/api/rider-dashboard")
   .then(r=>r.json())
   .then(setData);

 },[]);

 return(

  <div className="p-6">

   <h1 className="text-3xl font-bold mb-6">
    Rider Dashboard
   </h1>

   <div className="grid md:grid-cols-3 gap-4">

    <div className="bg-white shadow rounded-xl p-6">
     <div>Today's Earnings</div>
     <div className="text-3xl font-bold">
      ?{data?.earnings || 0}
     </div>
    </div>

    <div className="bg-white shadow rounded-xl p-6">
     <div>Deliveries</div>
     <div className="text-3xl font-bold">
      {data?.deliveries || 0}
     </div>
    </div>

    <div className="bg-white shadow rounded-xl p-6">
     <div>Riders</div>
     <div className="text-3xl font-bold">
      {data?.riders || 0}
     </div>
    </div>

   </div>

  </div>

 );

}





