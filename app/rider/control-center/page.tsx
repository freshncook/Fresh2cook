"use client";

import { useState } from "react";

export default function Page(){

 const [status,setStatus] =
  useState("Offline");

 async function updateStatus(
  newStatus:string
 ){

  const riderId =
   localStorage.getItem(
    "riderId"
   );

  await fetch(
   "/api/rider-status",
   {
    method:"POST",
    headers:{
     "Content-Type":
      "application/json"
    },
    body:JSON.stringify({
     riderId,
     status:newStatus
    })
   }
  );

  setStatus(
   newStatus
  );

 }

 return(

  <div className="p-6 max-w-4xl mx-auto">

   <h1 className="text-3xl font-bold mb-6">
    Rider Control Center
   </h1>

   <div className="bg-white rounded-xl shadow p-6">

    <div className="mb-4">

     Current Status:

     <b>
      {" "}
      {status}
     </b>

    </div>

    <div className="flex gap-3">

     <button
      onClick={()=>
       updateStatus(
        "Online"
       )
      }
      className="bg-green-600 text-white px-4 py-2 rounded"
     >
      Go Online
     </button>

     <button
      onClick={()=>
       updateStatus(
        "Offline"
       )
      }
      className="bg-red-600 text-white px-4 py-2 rounded"
     >
      Go Offline
     </button>

    </div>

   </div>

  </div>

 );

}





