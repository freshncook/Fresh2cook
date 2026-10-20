"use client";

import { useEffect,useState } from "react";

export default function Page(){

 const [tracking,setTracking] =
  useState<any>();

 useEffect(()=>{

  fetch("/api/customer-tracking")
   .then(r=>r.json())
   .then(setTracking);

 },[]);

 return(

  <div className="p-6 max-w-5xl mx-auto">

   <h1 className="text-3xl font-bold mb-6">
    Live Order Tracking
   </h1>

   <div className="bg-white rounded-xl shadow p-6">

    <div className="mb-3">
     Status:
     {" "}
     {tracking?.orderStatus}
    </div>

    <div className="mb-3">
     ETA:
     {" "}
     {tracking?.eta}
    </div>

    <div className="mb-3">
     Rider:
     {" "}
     {tracking?.riderName}
    </div>

    <div className="h-80 border rounded flex items-center justify-center">

      GOOGLE MAP PLACEHOLDER

    </div>

   </div>

  </div>

 );

}





