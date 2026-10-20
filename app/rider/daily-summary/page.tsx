"use client";

export default function Page(){

 return(
  <div className="p-6">

   <h1 className="text-3xl font-bold mb-6">
    Daily Summary
   </h1>

   <div className="grid md:grid-cols-3 gap-4">

    <div className="bg-white p-6 rounded-xl shadow">
     Deliveries Today
    </div>

    <div className="bg-white p-6 rounded-xl shadow">
     Earnings Today
    </div>

    <div className="bg-white p-6 rounded-xl shadow">
     Performance Score
    </div>

   </div>

  </div>
 );
}





