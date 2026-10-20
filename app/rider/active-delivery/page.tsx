"use client";

import { useEffect,useState } from "react";

export default function Page(){

 const [data,setData] =
  useState<any>(null);

 useEffect(()=>{

  fetch("/api/rider-timeline")
   .then(r=>r.json())
   .then(setData);

 },[]);

 return(

  <div className="p-6 max-w-4xl mx-auto">

   <h1 className="text-3xl font-bold mb-6">
    Delivery Timeline
   </h1>

   <div className="space-y-4">

    {data?.timeline?.map(
     (item:any,index:number)=>(
      <div
       key={index}
       className="bg-white shadow rounded-xl p-4"
      >
       <div className="font-bold">
        {item.step}
       </div>

       <div>
        {item.status}
       </div>

      </div>
     )
    )}

   </div>

  </div>

 );

}





