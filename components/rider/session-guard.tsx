"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RiderSessionGuard({
 children,
}:{
 children:React.ReactNode
}){

 const router =
  useRouter();

 useEffect(()=>{

  const riderId =
   localStorage.getItem(
    "riderId"
   );

  if(!riderId){

   router.push(
    "/rider/login"
   );

  }

 },[router]);

 return <>{children}</>;

}





