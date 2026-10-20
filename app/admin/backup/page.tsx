"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

export default function BackupPage() {
  const [backupSize,setBackupSize] = useState(0);

  useEffect(() => { calculateSize(); }, []);

  function calculateSize() {
    let size = 0;
    for(let i=0;i<localStorage.length;i++){
      const key=localStorage.key(i);
      if(key) size += key.length + (localStorage.getItem(key)||"").length;
    }
    setBackupSize(Math.round(size/1024));
  }

  function exportBackup() {
    const data:any = {};
    for(let i=0;i<localStorage.length;i++){
      const key=localStorage.key(i);
      if(key) data[key]=localStorage.getItem(key);
    }
    const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url;
    a.download="freshcut-backup.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function importBackup(event:any) {
    const file=event.target.files?.[0];
    if(!file)return;
    const reader=new FileReader();
    reader.onload=(e:any)=>{
      try{
        const data=JSON.parse(e.target.result);
        Object.keys(data).forEach(key=>localStorage.setItem(key,data[key]));
        alert("Backup Restored Successfully");
        calculateSize();
      }catch{ alert("Invalid Backup File"); }
    };
    reader.readAsText(file);
  }

  function clearDatabase() {
    if(!confirm("Delete Complete Database?"))return;
    localStorage.clear();
    alert("Database Cleared");
    window.location.reload();
  }

  return (
    <div className="min-h-screen bg-[#f5f7f7] p-5 md:p-7">
      <div className="mx-auto max-w-5xl">
        <Header title="Backup & Restore" subtitle="Protect and restore Fresh2Cook browser data." />

        <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-md">
          <div className="rounded-2xl bg-[#063f3d] p-7 text-white">
            <p className="text-sm text-emerald-100">Current Local Data Size</p>
            <p className="mt-2 text-5xl font-extrabold">{backupSize} KB</p>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-3">
            <button onClick={exportBackup} className="rounded-2xl bg-[#063f3d] py-4 font-bold text-white">Export Backup</button>
            <label className="cursor-pointer rounded-2xl bg-blue-600 py-4 text-center font-bold text-white">
              Import Backup
              <input type="file" accept=".json" onChange={importBackup} className="hidden"/>
            </label>
            <button onClick={clearDatabase} className="rounded-2xl bg-red-50 py-4 font-bold text-red-700">Clear Database</button>
          </div>

          <p className="mt-5 text-xs text-slate-500">Export creates a JSON backup of the current browser localStorage data.</p>
        </div>
      </div>
    </div>
  );
}

function Header({title,subtitle}:any){return <div className="mb-7"><p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-700">Fresh2Cook Admin</p><h1 className="mt-1 text-3xl font-extrabold text-[#123b38] md:text-4xl">{title}</h1><p className="mt-1 text-sm text-slate-500">{subtitle}</p></div>}









