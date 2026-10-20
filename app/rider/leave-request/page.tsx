"use client";

export default function Page(){

 return(
  <div className="p-6">

   <h1 className="text-3xl font-bold mb-6">
    Leave Request
   </h1>

   <textarea
    className="border p-3 w-full rounded"
    rows={5}
    placeholder="Reason"
   />

   <button
    className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
   >
    Submit Request
   </button>

  </div>
 );
}





