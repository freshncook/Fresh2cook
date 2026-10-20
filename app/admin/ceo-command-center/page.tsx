"use client";

export const dynamic = "force-dynamic";

import { useEffect,useState } from "react";

export default function Page(){

 const [ceo,setCeo] = useState<any>();
 const [kpi,setKpi] = useState<any>();
 const [forecast,setForecast] = useState<any>();

 useEffect(()=>{

  fetch("/api/ceo-dashboard")
   .then(r=>r.json())
   .then(setCeo);

  fetch("/api/business-kpi")
   .then(r=>r.json())
   .then(setKpi);

  fetch("/api/profit-forecast")
   .then(r=>r.json())
   .then(setForecast);

 },[]);

 return(

  <div className="p-6">

   <h1 className="text-4xl font-bold mb-6">
    CEO Command Center
   </h1>

   <div className="grid md:grid-cols-4 gap-5 mb-6">

    <div className="bg-white p-6 rounded-2xl shadow">
      Customers
      <div className="text-3xl font-bold">
       {ceo?.totalCustomers}
      </div>
    </div>

    <div className="bg-white p-6 rounded-2xl shadow">
      Orders
      <div className="text-3xl font-bold">
       {ceo?.totalOrders}
      </div>
    </div>

    <div className="bg-white p-6 rounded-2xl shadow">
      Revenue
      <div className="text-3xl font-bold">
       ?{kpi?.revenue}
      </div>
    </div>

    <div className="bg-white p-6 rounded-2xl shadow">
      Profit
      <div className="text-3xl font-bold">
       ?{kpi?.profit}
      </div>
    </div>

   </div>

   <div className="bg-white p-6 rounded-2xl shadow">

    <h2 className="font-bold text-xl mb-4">
      AI Forecast
    </h2>

    <div>
      Next Revenue:
      ?{forecast?.nextMonthRevenue}
    </div>

    <div>
      Next Profit:
      ?{forecast?.nextMonthProfit}
    </div>

    <div>
      Growth:
      {forecast?.growthForecast}%
    </div>

   </div>

  </div>

 );

}











