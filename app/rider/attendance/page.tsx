"use client";

import { useEffect,useState } from "react";

export default function Page(){

 const [data,setData]=useState<any>();

 useEffect(()=>{
  fetch("/api/rider-attendance")
   .then(r=>r.json())
   .then(setData);
 },[]);

 return(
  <div className="p-6">

   <h1 className="text-3xl font-bold mb-6">
    Attendance
   </h1>

   <div className="grid md:grid-cols-3 gap-4">

    <div className="bg-white p-6 rounded-xl shadow">
     Present
     <div className="text-3xl font-bold">
      {data?.presentDays || 0}
     </div>
    </div>

    <div className="bg-white p-6 rounded-xl shadow">
     Absent
     <div className="text-3xl font-bold">
      {data?.absentDays || 0}
     </div>
    </div>

    <div className="bg-white p-6 rounded-xl shadow">
     %
     <div className="text-3xl font-bold">
      {data?.attendancePercent || 0}
     </div>
    </div>

   </div>

  </div>
 );
}





