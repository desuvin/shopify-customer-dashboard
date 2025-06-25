import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const domain = process.env.SHOPIFY_STORE_DOMAIN!;
  const token = process.env.SHOPIFY_ADMIN_API_TOKEN!;

  const { customerId, key, value, namespace, type } = await req.json();

  const metafieldBody = {
    metafield: {
      namespace,
      key,
      type,
      value
    }
  };

  const res = await fetch(`https://${domain}/admin/api/2024-01/customers/${customerId}/metafields.json`, {
    method: 'POST',
    headers: {
      'X-Shopify-Access-Token': token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(metafieldBody)
  });

  const data = await res.json();
  return NextResponse.json(data);
}
