"use client";

import { useEffect,useState } from "react";

export default function Page(){

 const [data,setData]=useState<any>();

 useEffect(()=>{
  fetch("/api/rider-shift")
   .then(r=>r.json())
   .then(setData);
 },[]);

 return(
  <div className="p-6">

   <h1 className="text-3xl font-bold mb-6">
    Shift Details
   </h1>

   <div className="bg-white p-6 rounded-xl shadow">

    <div>
     Shift:
     {" "}
     {data?.currentShift}
    </div>

    <div>
     Start:
     {" "}
     {data?.startTime}
    </div>

    <div>
     End:
     {" "}
     {data?.endTime}
    </div>

   </div>

  </div>
 );
}





