import { NextResponse } from 'next/server';

export async function GET() {
  const domain = process.env.SHOPIFY_STORE_DOMAIN!;
  const token = process.env.SHOPIFY_ADMIN_API_TOKEN!;

  const customerResponse = await fetch(`https://${domain}/admin/api/2024-01/customers.json`, {
    headers: {
      'X-Shopify-Access-Token': token,
      'Content-Type': 'application/json',
    },
  });

  const { customers } = await customerResponse.json();

  const customerWithMetafields = await Promise.all(
    customers.map(async (customer: any) => {
      const metafieldsResponse = await fetch(`https://${domain}/admin/api/2024-01/customers/${customer.id}/metafields.json`, {
        headers: {
          'X-Shopify-Access-Token': token,
          'Content-Type': 'application/json',
        },
      });

        const metafieldsData = await metafieldsResponse.json();

        return {
          ...customer,
          metafields: metafieldsData.metafields || [],
        };
    }));
  
  return NextResponse.json(customerWithMetafields);
}
