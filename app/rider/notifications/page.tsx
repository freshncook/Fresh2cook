"use client";

import { useEffect,useState } from "react";

export default function Page(){

 const [data,setData] =
  useState<any>(null);

 useEffect(()=>{

  fetch("/api/rider-notifications")
   .then(r=>r.json())
   .then(setData);

 },[]);

 return(

  <div className="p-6 max-w-4xl mx-auto">

   <h1 className="text-3xl font-bold mb-6">
    Notifications
   </h1>

   <div className="space-y-4">

    {data?.notifications?.map(
     (n:any,index:number)=>(
      <div
       key={index}
       className="bg-white shadow rounded-xl p-4"
      >
       {n.title}
      </div>
     )
    )}

   </div>

  </div>

 );

}





