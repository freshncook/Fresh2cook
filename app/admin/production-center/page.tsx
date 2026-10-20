"use client";

export const dynamic = "force-dynamic";

import { useEffect,useState } from "react";

export default function Page(){

 const [payment,setPayment] =
  useState<any>();

 const [whatsapp,setWhatsapp] =
  useState<any>();

 const [wallet,setWallet] =
  useState<any>();

 useEffect(()=>{

  fetch("/api/payments/razorpay-status")
   .then(r=>r.json())
   .then(setPayment);

  fetch("/api/whatsapp/status")
   .then(r=>r.json())
   .then(setWhatsapp);

  fetch("/api/wallet/summary")
   .then(r=>r.json())
   .then(setWallet);

 },[]);

 return(

  <div className="p-5">

   <h1 className="text-4xl font-bold mb-6">
    Production Control Center
   </h1>

   <div className="grid md:grid-cols-3 gap-5">

    <div className="bg-white p-5 rounded-2xl shadow">
      Razorpay
      <div className="text-xl font-bold">
       {payment?.configured ? "Connected" : "Pending"}
      </div>
    </div>

    <div className="bg-white p-5 rounded-2xl shadow">
      WhatsApp API
      <div className="text-xl font-bold">
       {whatsapp?.configured ? "Connected" : "Pending"}
      </div>
    </div>

    <div className="bg-white p-5 rounded-2xl shadow">
      Wallet Value
      <div className="text-xl font-bold">
       ?{wallet?.totalWallet || 0}
      </div>
    </div>

   </div>

  </div>

 );

}











