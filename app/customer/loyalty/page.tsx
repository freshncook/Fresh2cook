"use client";

import { useEffect,useState } from "react";

export default function Page(){

 const [data,setData]=useState<any>();

 useEffect(()=>{
  fetch("/api/customer-loyalty")
   .then(r=>r.json())
   .then(setData);
 },[]);

 return(
  <div className="p-6">

   <h1 className="text-3xl font-bold mb-6">
    Loyalty Program
   </h1>

   <div className="grid md:grid-cols-3 gap-4">

    <div className="bg-white p-6 rounded-xl shadow">
      Points
      <div className="text-3xl font-bold">
       {data?.loyaltyPoints}
      </div>
    </div>

    <div className="bg-white p-6 rounded-xl shadow">
      Tier
      <div className="text-3xl font-bold">
       {data?.loyaltyTier}
      </div>
    </div>

    <div className="bg-white p-6 rounded-xl shadow">
      Next Reward
      <div className="text-3xl font-bold">
       {data?.nextRewardAt}
      </div>
    </div>

   </div>

  </div>
 );
}





