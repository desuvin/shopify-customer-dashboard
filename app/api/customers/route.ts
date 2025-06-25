import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const cursor = req.nextUrl.searchParams.get('cursor');
    const token = process.env.SHOPIFY_ADMIN_API_TOKEN;
    const domain = process.env.SHOPIFY_STORE_DOMAIN;

    // Validate environment variables
    if (!token || !domain) {
      return NextResponse.json(
        { error: 'Missing Shopify configuration' },
        { status: 500 }
      );
    }

    const endpoint = `https://${domain}/admin/api/2024-01/graphql.json`;

    const query = `
      query GetCustomers($cursor: String) {
        customers(first: 50, after: $cursor) {
          pageInfo {
            hasNextPage
          }
          edges {
            cursor
            node {
              id
              firstName
              lastName
              email
              metafields(first: 5, namespace: "custom") {
                edges {
                  node {
                    key
                    value
                  }
                }
              }
            }
          }
        }
      }
    `;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': token,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: cursor ? { cursor } : {},
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Shopify API Error:', {
        status: response.status,
        statusText: response.statusText,
        errorText,
      });
      return NextResponse.json(
        { 
          error: 'Shopify API request failed',
          status: response.status,
          details: errorText 
        },
        { status: response.status }
      );
    }

    const json = await response.json();

    // Check for GraphQL errors
    if (json.errors) {
      console.error('GraphQL Errors:', json.errors);
      return NextResponse.json(
        { error: 'GraphQL error', details: json.errors },
        { status: 500 }
      );
    }

    // Check if data structure is as expected
    if (!json.data?.customers?.edges) {
      console.error('Unexpected response structure:', json);
      return NextResponse.json(
        { error: 'Unexpected API response structure' },
        { status: 500 }
      );
    }

    const edges = json.data.customers.edges;
    const customers = edges.map((edge: any) => ({
      id: edge.node.id,
      first_name: edge.node.firstName,
      last_name: edge.node.lastName,
      email: edge.node.email,
      metafields: edge.node.metafields?.edges?.map((m: any) => ({
        key: m.node.key,
        value: m.node.value,
      })) || [],
    }));

    return NextResponse.json({
      customers,
      pageInfo: json.data.customers.pageInfo,
      endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}