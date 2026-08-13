import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

export async function GET() { const u=await currentUser(); if(!u)return NextResponse.json({error:"กรุณาเข้าสู่ระบบ"},{status:401}); const [rows]=await db.query("SELECT b.*,e.name AS equipment_name,e.code AS equipment_code,u.name AS borrower_name FROM equipment_borrowings b JOIN equipment e ON e.id=b.equipment_id JOIN users u ON u.id=b.user_id WHERE b.user_id=? OR ? IN ('admin','teacher') ORDER BY b.created_at DESC",[u.id,u.role]); return NextResponse.json(rows); }
export async function POST(request:Request){const u=await currentUser();if(!u)return NextResponse.json({error:"กรุณาเข้าสู่ระบบ"},{status:401});const b=await request.json();const[r]=await db.query("INSERT INTO equipment_borrowings(equipment_id,user_id,quantity,borrow_date,expected_return_date,purpose,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,NOW(),NOW())",[b.equipment_id,u.id,b.quantity??1,b.borrow_date??new Date().toISOString().slice(0,10),b.expected_return_date,b.purpose||null,"pending"]);return NextResponse.json({id:(r as {insertId:number}).insertId},{status:201});}
