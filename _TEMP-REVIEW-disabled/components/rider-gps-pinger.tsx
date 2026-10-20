"use client";

import { useEffect } from "react";

export default function RiderGpsPinger(){

 useEffect(()=>{

  const timer =
   setInterval(()=>{

    if(
      navigator.geolocation
    ){

     navigator.geolocation.getCurrentPosition(
      async(pos)=>{

       const riderId =
        localStorage.getItem(
         "riderId"
        );

       if(!riderId) return;

       await fetch(
        "/api/rider-location-update",
        {
         method:"POST",
         headers:{
          "Content-Type":
           "application/json"
         },
         body:JSON.stringify({
          riderId,
          latitude:
           pos.coords.latitude,
          longitude:
           pos.coords.longitude
         })
        }
       );

      }
     );

    }

   },30000);

   return()=>{
    clearInterval(timer);
   };

 },[]);

 return null;

}




