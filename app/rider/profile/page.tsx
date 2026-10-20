"use client";

import { useEffect, useState } from "react";

export default function Page() {

 const [data,setData] =
  useState<any>(null);

 useEffect(()=>{
  fetch("/api/rider-profile")
   .then(r=>r.json())
   .then(setData);
 },[]);

 const rider =
  data?.riders?.[0];

 return(
  <div className="p-6 max-w-4xl mx-auto">

   <h1 className="text-3xl font-bold mb-6">
    Rider Profile
   </h1>

   {!rider && (
    <div>
     Loading...
    </div>
   )}

   {rider && (

    <div className="bg-white rounded-xl shadow p-6">

     <div className="grid md:grid-cols-2 gap-4">

      <div>
       <b>Name:</b>
       {" "}
       {rider.name}
      </div>

      <div>
       <b>Mobile:</b>
       {" "}
       {rider.mobile}
      </div>

      <div>
       <b>Vehicle:</b>
       {" "}
       {rider.vehicle}
      </div>

      <div>
       <b>Status:</b>
       {" "}
       {rider.status}
      </div>

      <div>
       <b>Approval:</b>
       {" "}
       {rider.approvalStatus}
      </div>

      <div>
       <b>Rating:</b>
       {" "}
       ? {rider.rating}
      </div>

     </div>

    </div>

   )}

  </div>
 );
}





