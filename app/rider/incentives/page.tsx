"use client";

import { useEffect,useState } from "react";

export default function Page(){

 const [data,setData] =
  useState<any>();

 useEffect(()=>{
  fetch("/api/rider-incentives")
   .then(r=>r.json())
   .then(setData);
 },[]);

 return(
  <div className="p-6">

   <h1 className="text-3xl font-bold mb-6">
    Incentives
   </h1>

   <div className="space-y-3">

    {data?.incentives?.map((i:any,index:number)=>(
     <div
      key={index}
      className="bg-white p-4 rounded-xl shadow"
     >
      {i.title}
      <br/>
      ?{i.amount}
     </div>
    ))}

   </div>

  </div>
 );
}





