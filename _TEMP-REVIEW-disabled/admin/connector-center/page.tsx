"use client";

export const dynamic = "force-dynamic";

import { useEffect,useState } from "react";

export default function Page(){

 const [data,setData] =
  useState<any>();

 useEffect(()=>{

  fetch("/api/system/env-status")
   .then(r=>r.json())
   .then(setData);

 },[]);

 return(

  <div className="p-6">

   <h1 className="text-4xl font-bold mb-6">
    Connector Center
   </h1>

   <div className="grid md:grid-cols-5 gap-4">

    <div className="bg-white p-6 rounded-xl shadow">
      Razorpay
      <div>
       {data?.razorpay
        ? "Connected"
        : "Missing"}
      </div>
    </div>

    <div className="bg-white p-6 rounded-xl shadow">
      WhatsApp
      <div>
       {data?.whatsapp
        ? "Connected"
        : "Missing"}
      </div>
    </div>

    <div className="bg-white p-6 rounded-xl shadow">
      Maps
      <div>
       {data?.maps
        ? "Connected"
        : "Missing"}
      </div>
    </div>

    <div className="bg-white p-6 rounded-xl shadow">
      Firebase
      <div>
       {data?.firebase
        ? "Connected"
        : "Missing"}
      </div>
    </div>

    <div className="bg-white p-6 rounded-xl shadow">
      Supabase
      <div>
       {data?.supabase
        ? "Connected"
        : "Missing"}
      </div>
    </div>

   </div>

  </div>

 );

}







