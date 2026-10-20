"use client";
import {useEffect,useState} from "react";

export default function Page(){

 const [data,setData]=useState<any>();

 useEffect(()=>{
  fetch("/api/fleet-otp-monitor")
   .then(r=>r.json())
   .then(setData);
 },[]);

 return(
  <div className="p-6">
   <h1 className="text-3xl font-bold">
    OTP Monitor
   </h1>
   <pre>{JSON.stringify(data,null,2)}</pre>
  </div>
 );
}





