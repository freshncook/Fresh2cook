"use client";

import { useEffect,useState } from "react";

export default function Page(){

 const [data,setData]=useState<any>();

 useEffect(()=>{
  fetch("/api/customer-rewards")
   .then(r=>r.json())
   .then(setData);
 },[]);

 return(
  <div className="p-6">

   <h1 className="text-3xl font-bold mb-6">
    Rewards Center
   </h1>

   <div className="space-y-3">

    {data?.rewards?.map(
      (reward:any,index:number)=>(
       <div
        key={index}
        className="bg-white p-4 rounded-xl shadow"
       >
        {reward.title}
        <br/>
        {reward.points} Points
       </div>
      )
    )}

   </div>

  </div>
 );
}





