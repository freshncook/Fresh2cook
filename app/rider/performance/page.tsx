"use client";

import { useEffect,useState } from "react";

export default function Page(){

 const [data,setData] =
  useState<any>(null);

 useEffect(()=>{

  fetch("/api/rider-performance")
   .then(r=>r.json())
   .then(setData);

 },[]);

 return(

  <div className="p-6 max-w-4xl mx-auto">

   <h1 className="text-3xl font-bold mb-6">
    Performance Dashboard
   </h1>

   <div className="grid md:grid-cols-3 gap-4">

    <div className="bg-white shadow rounded-xl p-6">
     <div>Performance Score</div>
     <div className="text-3xl font-bold">
      {data?.score || 0}
     </div>
    </div>

    <div className="bg-white shadow rounded-xl p-6">
     <div>Total Deliveries</div>
     <div className="text-3xl font-bold">
      {data?.deliveries || 0}
     </div>
    </div>

    <div className="bg-white shadow rounded-xl p-6">
     <div>Rating</div>
     <div className="text-3xl font-bold">
      ? {data?.rating || 0}
     </div>
    </div>

   </div>

  </div>

 );

}





