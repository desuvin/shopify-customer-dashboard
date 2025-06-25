// app/api/customers/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const domain = process.env.SHOPIFY_STORE_DOMAIN!;
  const token = process.env.SHOPIFY_ADMIN_API_TOKEN!;

  const response = await fetch(`https://${domain}/admin/api/2024-01/customers.json`, {
    headers: {
      'X-Shopify-Access-Token': token,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  return NextResponse.json(data.customers);
}
