"use client";

import { useState } from "react";

export default function Page(){

 const [assignmentId,setAssignmentId] =
  useState("");

 const [otp,setOtp] =
  useState("");

 const [message,setMessage] =
  useState("");

 async function completeOrder(){

  const verify =
   await fetch(
    "/api/rider-verify-otp",
    {
     method:"POST",
     headers:{
      "Content-Type":
       "application/json"
     },
     body:JSON.stringify({
      assignmentId,
      otp
     })
    }
   );

  const verifyData =
   await verify.json();

  if(!verifyData.success){

   setMessage(
    "Invalid OTP"
   );

   return;
  }

  const complete =
   await fetch(
    "/api/rider-complete-order",
    {
     method:"POST"
    }
   );

  const completeData =
   await complete.json();

  setMessage(
   completeData.message ||
   "Delivery Completed"
  );

 }

 return(
  <div className="p-6 max-w-xl mx-auto">

   <h1 className="text-3xl font-bold mb-6">
    Complete Delivery
   </h1>

   <input
    className="border p-3 rounded w-full mb-3"
    placeholder="Assignment ID"
    value={assignmentId}
    onChange={(e)=>
     setAssignmentId(e.target.value)
    }
   />

   <input
    className="border p-3 rounded w-full"
    placeholder="Customer OTP"
    value={otp}
    onChange={(e)=>
     setOtp(e.target.value)
    }
   />

   <button
    onClick={completeOrder}
    className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
   >
    Complete Delivery
   </button>

   <div className="mt-4">
    {message}
   </div>

  </div>
 );
}





