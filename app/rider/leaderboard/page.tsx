"use client";

import { useEffect,useState } from "react";

export default function Page(){

 const [data,setData] =
  useState<any>();

 useEffect(()=>{
  fetch("/api/rider-leaderboard")
   .then(r=>r.json())
   .then(setData);
 },[]);

 return(
  <div className="p-6">

   <h1 className="text-3xl font-bold mb-6">
    Rider Leaderboard
   </h1>

   <div className="space-y-3">

    {data?.riders?.map((r:any)=>(
     <div
      key={r.rank}
      className="bg-white p-4 rounded-xl shadow"
     >
      #{r.rank} - {r.name}
      <br/>
      Deliveries: {r.deliveries}
     </div>
    ))}

   </div>

  </div>
 );
}





