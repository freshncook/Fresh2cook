"use client";

export const dynamic = "force-dynamic";

import { useEffect,useState } from "react";

export default function Page(){

 const [rider,setRider] =
  useState<any>();

 const [delivery,setDelivery] =
  useState<any>();

 const [push,setPush] =
  useState<any>();

 useEffect(()=>{

  fetch("/api/tracking/rider-location")
   .then(r=>r.json())
   .then(setRider);

  fetch("/api/tracking/delivery-status")
   .then(r=>r.json())
   .then(setDelivery);

  fetch("/api/push/status")
   .then(r=>r.json())
   .then(setPush);

 },[]);

 return(

  <div className="p-6">

   <h1 className="text-4xl font-bold mb-6">
    Tracking Center
   </h1>

   <div className="grid md:grid-cols-3 gap-4">

    <div className="bg-white p-6 rounded-xl shadow">
      Rider
      <div>{rider?.rider?.name}</div>
      <div>{rider?.rider?.status}</div>
    </div>

    <div className="bg-white p-6 rounded-xl shadow">
      Delivery
      <div>{delivery?.status}</div>
      <div>{delivery?.eta}</div>
    </div>

    <div className="bg-white p-6 rounded-xl shadow">
      Push Engine
      <div>{push?.pushNotifications}</div>
    </div>

   </div>

  </div>

 );

}







