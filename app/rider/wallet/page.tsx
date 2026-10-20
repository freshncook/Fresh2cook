"use client";

import { useEffect,useState } from "react";

export default function Page(){

 const [data,setData]=useState<any>();

 useEffect(()=>{
  fetch("/api/rider-wallet-summary")
   .then(r=>r.json())
   .then(setData);
 },[]);

 return(
  <div className="p-6">
   <h1 className="text-3xl font-bold mb-6">
    Rider Wallet
   </h1>

   <div className="grid md:grid-cols-3 gap-4">

    <div className="bg-white p-6 rounded-xl shadow">
     Balance
     <div className="text-3xl font-bold">
      ?{data?.walletBalance || 0}
     </div>
    </div>

    <div className="bg-white p-6 rounded-xl shadow">
     Today
     <div className="text-3xl font-bold">
      ?{data?.todayEarning || 0}
     </div>
    </div>

    <div className="bg-white p-6 rounded-xl shadow">
     Week
     <div className="text-3xl font-bold">
      ?{data?.weekEarning || 0}
     </div>
    </div>

   </div>
  </div>
 );
}





