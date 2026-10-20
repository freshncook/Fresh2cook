"use client";

import { useEffect,useState } from "react";

export default function Page(){

 const [data,setData]=useState<any>();

 useEffect(()=>{
  fetch("/api/customer-vip")
   .then(r=>r.json())
   .then(setData);
 },[]);

 return(
  <div className="p-6">

   <h1 className="text-3xl font-bold mb-6">
    VIP Membership
   </h1>

   <div className="bg-white p-6 rounded-xl shadow">

    <div>
      Membership:
      {" "}
      {data?.membership}
    </div>

    <div>
      Free Delivery:
      {" "}
      {String(data?.freeDelivery)}
    </div>

    <div>
      Cashback:
      {" "}
      {data?.cashbackRate}
    </div>

   </div>

  </div>
 );
}





