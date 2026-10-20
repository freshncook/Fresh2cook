import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateRiderScore } from "@/lib/rider-priority";

export async function GET() {

 try {

  const riders =
   await prisma.deliveryBoy.findMany();

  const orders =
   await prisma.order.findMany({
    where:{
     status:"Ready For Dispatch"
    },
    orderBy:{
     id:"desc"
    }
   });

  const assignments =
   await prisma.deliveryAssignment.findMany({
    where:{
     status:{
      notIn:[
       "Delivered",
       "Cancelled"
      ]
     }
    }
   });

  const result=[];

  for(const order of orders){

   const riderList=riders.map(r=>{

    const activeOrders=
     assignments.filter(
      a=>a.deliveryBoyId===r.id
     ).length;

    const score=
     calculateRiderScore(
      {
       ...r,
       activeOrders
      },
      order
     );

    return{
     id:r.id,
     name:r.name,
     score,
     activeOrders,
     status:r.status
    };

   })
   .sort(
    (a,b)=>b.score-a.score
   )
   .slice(0,3);

   result.push({
    orderId:order.id,
    customer:order.customer,
    address:order.address,
    recommendations:riderList
   });

  }

  return NextResponse.json({
   success:true,
   recommendations:result
  });

 } catch(error){

  console.error(error);

  return NextResponse.json(
   {
    success:false
   },
   {
    status:500
   }
  );

 }

}


