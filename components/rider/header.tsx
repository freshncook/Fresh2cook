"use client";

import { useRouter } from "next/navigation";

export default function RiderHeader(){

 const router =
  useRouter();

 function logout(){

  localStorage.removeItem(
   "riderId"
  );

  router.push(
   "/rider/login"
  );

 }

 return(

  <div className="bg-green-600 text-white p-4 flex justify-between items-center rounded-xl">

   <div className="font-bold">
    Fresh2Cook Rider
   </div>

   <button
    onClick={logout}
    className="bg-white text-black px-3 py-1 rounded"
   >
    Logout
   </button>

  </div>

 );

}





