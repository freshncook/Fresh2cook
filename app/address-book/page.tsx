"use client";

import { useEffect, useState } from "react";

export default function AddressBookPage() {
  const [addresses,setAddresses]=useState<any[]>([]);
  const [customer,setCustomer]=useState("");
  const [phone,setPhone]=useState("");
  const [label,setLabel]=useState("Home");
  const [address,setAddress]=useState("");
  const [city,setCity]=useState("Delhi");
  const [pincode,setPincode]=useState("");
  const [isDefault,setIsDefault]=useState(true);

  async function loadAddresses() {
    if(!phone) return;

    const res=await fetch(
      `/api/customer-addresses?phone=${phone}`,
      { cache:"no-store" }
    );

    const data=await res.json();

    setAddresses(
      Array.isArray(data)
        ? data
        : []
    );
  }

  async function saveAddress() {

    if(!customer || !phone || !address){
      alert("Fill required fields");
      return;
    }

    const res=await fetch(
      "/api/customer-addresses",
      {
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({
          customer,
          phone,
          label,
          address,
          city,
          pincode,
          isDefault
        })
      }
    );

    const data=await res.json();

    if(data.success){
      setAddress("");
      setPincode("");
      loadAddresses();
    }
  }

  useEffect(()=>{
    const c=
      localStorage.getItem("freshcut-customer")||"";

    const p=
      localStorage.getItem("freshcut-phone")||"";

    setCustomer(c);
    setPhone(p);
  },[]);

  useEffect(()=>{
    if(phone){
      loadAddresses();
    }
  },[phone]);

  return (
    <div className="max-w-5xl mx-auto p-4">

      <h1 className="text-3xl font-bold mb-5">
        Address Book
      </h1>

      <div className="rounded-xl border bg-white p-4 mb-5">

        <div className="grid md:grid-cols-2 gap-3">

          <input
            value={label}
            onChange={(e)=>setLabel(e.target.value)}
            placeholder="Home / Office"
            className="border rounded p-3"
          />

          <input
            value={city}
            onChange={(e)=>setCity(e.target.value)}
            placeholder="City"
            className="border rounded p-3"
          />

          <textarea
            value={address}
            onChange={(e)=>setAddress(e.target.value)}
            placeholder="Full Address"
            className="border rounded p-3 md:col-span-2"
          />

          <input
            value={pincode}
            onChange={(e)=>setPincode(e.target.value)}
            placeholder="Pincode"
            className="border rounded p-3"
          />

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e)=>
                setIsDefault(e.target.checked)
              }
            />
            Default Address
          </label>

        </div>

        <button
          onClick={saveAddress}
          className="mt-4 rounded-lg bg-green-600 px-5 py-3 text-white"
        >
          Save Address
        </button>

      </div>

      <div className="grid gap-4">

        {addresses.map((item)=>(
          <div
            key={item.id}
            className="rounded-xl border bg-white p-4"
          >
            <div className="flex justify-between">

              <div>
                <div className="font-bold">
                  {item.label}
                </div>

                <div className="text-sm">
                  {item.address}
                </div>

                <div className="text-sm text-gray-500">
                  {item.city} - {item.pincode}
                </div>
              </div>

              <div className="flex gap-2">

  {item.isDefault && (
    <div className="text-green-600 font-bold">
      Default
    </div>
  )}

  {!item.isDefault && (
    <button
      onClick={async()=>{
        await fetch(
          `/api/customer-addresses/${item.id}`,
          {
            method:"PUT"
          }
        );
        loadAddresses();
      }}
      className="text-blue-600 text-sm"
    >
      Set Default
    </button>
  )}

  <button
    onClick={async()=>{
      if(!confirm("Delete Address?")){
        return;
      }

      await fetch(
        `/api/customer-addresses/${item.id}`,
        {
          method:"DELETE"
        }
      );

      loadAddresses();
    }}
    className="text-red-600 text-sm"
  >
    Delete
  </button>

</div>

            </div>
          </div>
        ))}

      </div>

    </div>
  );
}


