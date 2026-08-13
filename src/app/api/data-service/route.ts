import { NextResponse } from "next/server";

export async function GET() {
  const endpoint = process.env.TIDB_DATA_API_URL;
  const publicKey = process.env.TIDB_DATA_API_PUBLIC_KEY;
  const privateKey = process.env.TIDB_DATA_API_PRIVATE_KEY;

  if (!endpoint || !publicKey || !privateKey) {
    return NextResponse.json({ ok: false, error: "ตั้งค่า TiDB Data Service API key ใน .env.local ก่อน" }, { status: 500 });
  }

  const credentials = Buffer.from(`${publicKey}:${privateKey}`).toString("base64");
  const response = await fetch(endpoint, {
    headers: { Authorization: `Basic ${credentials}`, Accept: "application/json" },
    cache: "no-store",
  });
  const body = await response.text();

  return new NextResponse(body, {
    status: response.status,
    headers: { "content-type": response.headers.get("content-type") ?? "application/json" },
  });
}
