"use client";

import { useEffect,useState } from "react";

export default function Page(){

 const [data,setData] =
  useState<any>(null);

 useEffect(()=>{
  fetch("/api/rider-activity-log")
   .then(r=>r.json())
   .then(setData);
 },[]);

 return(
  <div className="p-6">

   <h1 className="text-3xl font-bold mb-6">
    Activity History
   </h1>

   <div className="space-y-3">

    {data?.logs?.map(
     (log:any,index:number)=>(
      <div
       key={index}
       className="bg-white p-4 rounded-xl shadow"
      >
       <div>{log.action}</div>
       <div className="text-sm text-gray-500">
        {String(log.time)}
       </div>
      </div>
     )
    )}

   </div>

  </div>
 );
}





