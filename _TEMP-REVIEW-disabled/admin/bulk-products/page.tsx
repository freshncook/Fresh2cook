"use client";

export const dynamic = "force-dynamic";

import { useEffect,useState } from "react";

export default function AdminProductsPage() {
  const [products,setProducts]=useState<any[]>([]);
  const [name,setName]=useState("");
  const [price,setPrice]=useState("");
  const [stock,setStock]=useState("");
  const [pack,setPack]=useState("");
  const [image,setImage]=useState("");

  useEffect(()=>loadProducts(),[]);

  function loadProducts(){
    try{setProducts(JSON.parse(localStorage.getItem("freshcut-products")||"[]"))}
    catch{setProducts([])}
  }

  function addProduct(){
    if(!name.trim()||!price){alert("Product Name & Price Required");return}
    const product={id:Date.now(),name:name.trim(),price:Number(price),stock,pack,image};
    const updated=[product,...products];
    localStorage.setItem("freshcut-products",JSON.stringify(updated));
    setProducts(updated);
    setName("");setPrice("");setStock("");setPack("");setImage("");
    alert("Product Added Successfully");
  }

  function deleteProduct(id:number){
    const updated=products.filter(p=>p.id!==id);
    localStorage.setItem("freshcut-products",JSON.stringify(updated));
    setProducts(updated);
  }

  return (
    <div className="min-h-screen bg-[#f5f7f7] p-5 md:p-7">
      <div className="mx-auto max-w-[1600px]">
        <Header title="Bulk Product Management" subtitle="Quickly create and manage products stored in the Fresh2Cook catalogue." />

        <div className="mb-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-extrabold text-[#123b38]">Add Product</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="Product Name" className="rounded-xl border px-4 py-3 text-sm"/>
            <input value={price} onChange={e=>setPrice(e.target.value)} placeholder="Price" className="rounded-xl border px-4 py-3 text-sm"/>
            <input value={stock} onChange={e=>setStock(e.target.value)} placeholder="Stock" className="rounded-xl border px-4 py-3 text-sm"/>
            <input value={pack} onChange={e=>setPack(e.target.value)} placeholder="Pack Size" className="rounded-xl border px-4 py-3 text-sm"/>
          </div>
          <input value={image} onChange={e=>setImage(e.target.value)} placeholder="Image URL" className="mt-4 w-full rounded-xl border px-4 py-3 text-sm"/>
          <button onClick={addProduct} className="mt-4 rounded-xl bg-[#063f3d] px-7 py-3 text-sm font-bold text-white">+ Add Product</button>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map(product=>(
            <div key={product.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="h-48 bg-slate-100">
                {product.image ? <img src={product.image} alt={product.name} className="h-full w-full object-cover"/> : <div className="flex h-full items-center justify-center text-sm text-slate-400">No Image</div>}
              </div>
              <div className="p-5">
                <h2 className="font-extrabold text-[#123b38]">{product.name}</h2>
                <p className="mt-2 text-xl font-extrabold text-emerald-700">â‚¹{product.price}</p>
                <div className="mt-3 space-y-1 text-xs text-slate-500">
                  <p>Stock: {product.stock || 0}</p>
                  <p>Pack: {product.pack || "â€”"}</p>
                </div>
                <button onClick={()=>deleteProduct(product.id)} className="mt-5 w-full rounded-xl bg-red-50 py-2.5 text-sm font-bold text-red-700">Delete</button>
              </div>
            </div>
          ))}
        </div>

        {!products.length && <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500">No products found.</div>}
      </div>
    </div>
  );
}
function Header({title,subtitle}:any){return <div className="mb-7"><p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-700">Fresh2Cook Admin</p><h1 className="mt-1 text-3xl font-extrabold text-[#123b38] md:text-4xl">{title}</h1><p className="mt-1 text-sm text-slate-500">{subtitle}</p></div>}






