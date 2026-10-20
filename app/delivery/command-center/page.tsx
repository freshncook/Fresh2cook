"use client";

import { useEffect,useState } from "react";

export default function Page(){

 const [eta,setEta] =
  useState<any>();

 const [route,setRoute] =
  useState<any>();

 useEffect(()=>{

  fetch("/api/dynamic-eta")
   .then(r=>r.json())
   .then(setEta);

  fetch("/api/route-recalculation")
   .then(r=>r.json())
   .then(setRoute);

 },[]);

 return(

  <div className="p-6">

   <h1 className="text-3xl font-bold mb-6">
    Fleet AI Enterprise Dashboard
   </h1>

   <div className="grid md:grid-cols-4 gap-4">

    <div className="bg-white p-6 rounded-xl shadow">
      ETA
      <div className="text-3xl font-bold">
       {eta?.etaMinutes}
      </div>
    </div>

    <div className="bg-white p-6 rounded-xl shadow">
      Distance
      <div className="text-3xl font-bold">
       {eta?.distanceKm}
      </div>
    </div>

    <div className="bg-white p-6 rounded-xl shadow">
      Traffic
      <div className="text-3xl font-bold">
       {eta?.trafficStatus}
      </div>
    </div>

    <div className="bg-white p-6 rounded-xl shadow">
      Route
      <div className="text-3xl font-bold">
       {route?.routeUpdated
         ? "Updated"
         : "Normal"}
      </div>
    </div>

   </div>

  </div>

 );

}





