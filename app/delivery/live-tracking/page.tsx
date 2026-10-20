"use client";

import { useEffect,useState } from "react";

export default function Page(){

 const [data,setData] =
  useState<any>();

 useEffect(()=>{

  fetch("/api/multi-rider-tracking")
   .then(r=>r.json())
   .then(setData);

 },[]);

 return(

  <div className="p-6">

   <h1 className="text-3xl font-bold mb-6">
    Fleet Intelligence V2
   </h1>

   <div className="bg-white p-6 rounded-xl shadow">

    <h2 className="font-bold mb-4">
     Live Riders
    </h2>

    {data?.riders?.map((r:any)=>(

     <div
      key={r.id}
      className="border-b py-3"
     >

      <div>
       {r.name}
      </div>

      <div>
       Lat:
       {" "}
       {r.latitude}
      </div>

      <div>
       Lng:
       {" "}
       {r.longitude}
      </div>

      <div>
       Status:
       {" "}
       {r.status}
      </div>

     </div>

    ))}

   </div>

  </div>

 );

}





