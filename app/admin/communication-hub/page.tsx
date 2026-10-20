"use client";

export const dynamic = "force-dynamic";

import { useEffect,useState } from "react";

export default function Page(){

 const [data,setData] =
  useState<any>();

 useEffect(()=>{

  fetch("/api/notifications/center")
   .then(r=>r.json())
   .then(setData);

 },[]);

 return(

  <div className="p-5">

   <h1 className="text-4xl font-bold mb-6">
    Communication Hub
   </h1>

   <div className="bg-white p-5 rounded-2xl shadow">

    <h2 className="font-bold mb-4">
      Notifications
    </h2>

    {data?.notifications?.map(
      (item:string,index:number)=>(
       <div key={index}>
        • {item}
       </div>
    ))}

   </div>

  </div>

 );

}











