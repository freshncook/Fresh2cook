"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";

export default function BulkUploadPage() {
  const [loading,setLoading]=useState(false);
  const [imported,setImported]=useState(0);

  async function uploadCSV(e:any){
    const file=e.target.files?.[0];
    if(!file)return;
    setLoading(true);
    setImported(0);

    try{
      const text=await file.text();
      const rows=text.split(/\r?\n/).filter((row:string)=>row.trim()!=="");
      let count=0;

      for(let i=1;i<rows.length;i++){
        const cols=rows[i].split(",");
        if(cols.length<4)continue;

        const product={
          name:cols[0]?.trim(),
          price:Number(cols[1])||0,
          pack:cols[2]?.trim(),
          stock:Number(cols[3])||0,
          image:cols[4]?.trim()||"",
          category:"Vegetables",
          description:"",
        };

        const res=await fetch("/api/products",{
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body:JSON.stringify(product),
        });

        if(res.ok)count++;
      }

      setImported(count);
      alert(`${count} Products Imported Successfully`);
    }catch(error){
      console.error(error);
      alert("CSV Upload Failed");
    }

    setLoading(false);
    e.target.value="";
  }

  return (
    <div className="min-h-screen bg-[#f5f7f7] p-5 md:p-7">
      <div className="mx-auto max-w-5xl">
        <Header title="Bulk Product Upload" subtitle="Import multiple products directly from a CSV file." />

        <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
          <h2 className="text-lg font-extrabold text-[#123b38]">Upload Product CSV</h2>
          <p className="mt-2 text-sm text-slate-500">CSV columns must follow this order:</p>

          <div className="mt-5 rounded-xl bg-[#063f3d] p-5 font-mono text-sm text-white">
            name,price,pack,stock,image<br/>
            Fresh2Cook Bhindi,49,500g,100,<br/>
            Fresh2Cook Beans,59,500g,80,
          </div>

          <label className="mt-6 block cursor-pointer rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50 p-8 text-center">
            <span className="font-bold text-emerald-800">Choose CSV File</span>
            <input type="file" accept=".csv" onChange={uploadCSV} className="hidden"/>
          </label>

          {loading && <p className="mt-5 font-bold text-emerald-700">Uploading Products...</p>}
          {!loading && imported>0 && <p className="mt-5 font-bold text-emerald-700">{imported} products imported.</p>}
        </div>
      </div>
    </div>
  );
}
function Header({title,subtitle}:any){return <div className="mb-7"><p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-700">Fresh2Cook Admin</p><h1 className="mt-1 text-3xl font-extrabold text-[#123b38] md:text-4xl">{title}</h1><p className="mt-1 text-sm text-slate-500">{subtitle}</p></div>}






