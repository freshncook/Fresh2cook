"use client";

import { useEffect,useState } from "react";

export default function Page(){

 const [data,setData] = useState<any>();

 useEffect(()=>{
  fetch("/api/customer-growth-ai")
   .then(r=>r.json())
   .then(setData);
 },[]);

 return(
  <div className="p-6">

   <h1 className="text-3xl font-bold mb-6">
    Customer Growth AI
   </h1>

   <div className="grid md:grid-cols-4 gap-4">

    <div className="bg-white p-6 rounded-xl shadow">
      Repeat
      <div className="text-3xl font-bold">
       {data?.repeatCustomers}
      </div>
    </div>

    <div className="bg-white p-6 rounded-xl shadow">
      Churn
      <div className="text-3xl font-bold">
       {data?.churnRisk}
      </div>
    </div>

    <div className="bg-white p-6 rounded-xl shadow">
      Loyalty
      <div className="text-3xl font-bold">
       {data?.loyaltyCustomers}
      </div>
    </div>

    <div className="bg-white p-6 rounded-xl shadow">
      Score
      <div className="text-3xl font-bold">
       {data?.growthScore}
      </div>
    </div>

   </div>

  </div>
 );
}





