"use client";

export const dynamic = "force-dynamic";

import { useEffect,useState } from "react";

export default function Page(){

 const [revenue,setRevenue] = useState<any>();
 const [customer,setCustomer] = useState<any>();
 const [product,setProduct] = useState<any>();
 const [report,setReport] = useState<any>();

 useEffect(()=>{

  fetch("/api/revenue-analytics")
   .then(r=>r.json())
   .then(setRevenue);

  fetch("/api/customer-analytics")
   .then(r=>r.json())
   .then(setCustomer);

  fetch("/api/product-analytics")
   .then(r=>r.json())
   .then(setProduct);

  fetch("/api/executive-report")
   .then(r=>r.json())
   .then(setReport);

 },[]);

 return(

  <div className="p-6">

   <h1 className="text-4xl font-bold mb-6">
    Enterprise BI Dashboard
   </h1>

   <div className="grid md:grid-cols-4 gap-4 mb-6">

    <div className="bg-white p-6 rounded-xl shadow">
      Revenue
      <div className="text-2xl font-bold">
       ?{revenue?.monthlyRevenue}
      </div>
    </div>

    <div className="bg-white p-6 rounded-xl shadow">
      Customers
      <div className="text-2xl font-bold">
       {customer?.totalCustomers}
      </div>
    </div>

    <div className="bg-white p-6 rounded-xl shadow">
      Repeat
      <div className="text-2xl font-bold">
       {customer?.repeatCustomers}
      </div>
    </div>

    <div className="bg-white p-6 rounded-xl shadow">
      AOV
      <div className="text-2xl font-bold">
       ?{revenue?.avgOrderValue}
      </div>
    </div>

   </div>

   <div className="bg-white p-6 rounded-xl shadow mb-6">

    <h2 className="font-bold text-xl mb-3">
      Top Products
    </h2>

    {product?.topProducts?.map(
      (item:string,index:number)=>(
       <div key={index}>
        ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ {item}
       </div>
      )
    )}

   </div>

   <div className="bg-white p-6 rounded-xl shadow">

    <h2 className="font-bold text-xl mb-3">
      Executive Report
    </h2>

    <div>{report?.summary}</div>
    <div>{report?.recommendation}</div>

   </div>

  </div>

 );

}







