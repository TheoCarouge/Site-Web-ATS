import Client from 'shopify-buy';

const client = Client.buildClient({
  domain: import.meta.env.VITE_SHOPIFY_DOMAIN || 'your-shop-name.myshopify.com',
  storefrontAccessToken: import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN || 'your-storefront-access-token',
  apiVersion: '2024-01'
});

export const fetchProduct = async (handle: string) => {
  try {
    const query = `
      query getProduct($handle: String!) {
        product(handle: $handle) {
          id
          title
          handle
          description
          availableForSale
          options {
            name
            values
          }
          images(first: 50) {
            edges {
              node {
                url
                altText
              }
            }
          }
          variants(first: 100) {
            edges {
              node {
                id
                title
                availableForSale
                price {
                  amount
                  currencyCode
                }
                selectedOptions {
                  name
                  value
                }
                image {
                  url
                  altText
                }
              }
            }
          }
          mockupFront: metafield(namespace: "custom", key: "mockup_front") {
            reference {
              ... on MediaImage { image { url } }
            }
          }
          mockupBack: metafield(namespace: "custom", key: "mockup_back") {
            reference {
              ... on MediaImage { image { url } }
            }
          }
          mockupLeft: metafield(namespace: "custom", key: "mockup_left") {
            reference {
              ... on MediaImage { image { url } }
            }
          }
          mockupRight: metafield(namespace: "custom", key: "mockup_right") {
            reference {
              ... on MediaImage { image { url } }
            }
          }
        }
      }
    `;

    const domain = import.meta.env.VITE_SHOPIFY_DOMAIN || 'your-shop-name.myshopify.com';
    const token = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN || '';
    const url = `https://${domain}/api/2024-01/graphql.json`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': token,
      },
      body: JSON.stringify({ query, variables: { handle } }),
    });

    const json = await response.json();
    if (json.errors) return null;
    return json.data?.product ?? null;
  } catch {
    return null;
  }
};

// GraphQL-based fetchAll with availability info
export const fetchAllProducts = async () => {
  try {
    const query = `
      query getAllProducts {
        products(first: 50) {
          edges {
            node {
              id
              title
              handle
              availableForSale
              vendor
              productType
              options {
                name
                values
              }
              images(first: 1) {
                edges {
                  node { url altText }
                }
              }
              variants(first: 100) {
                edges {
                  node {
                    id
                    title
                    availableForSale
                    price { amount currencyCode }
                    selectedOptions { name value }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const domain = import.meta.env.VITE_SHOPIFY_DOMAIN || 'your-shop-name.myshopify.com';
    const token = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN || '';
    const url = `https://${domain}/api/2024-01/graphql.json`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': token,
      },
      body: JSON.stringify({ query }),
    });

    const json = await response.json();
    if (json.errors || !json.data) return [];

    return json.data.products.edges.map((e: any) => {
      const node = e.node;
      const variants = node.variants.edges.map((ve: any) => ve.node);
      return {
        id: node.id,
        title: node.title,
        handle: node.handle,
        availableForSale: node.availableForSale,
        vendor: node.vendor,
        productType: node.productType,
        options: node.options,
        images: [{ src: node.images.edges[0]?.node?.url || '' }],
        variants,
      };
    });
  } catch {
    // Fallback to SDK
    try {
      return await client.product.fetchAll();
    } catch {
      return [];
    }
  }
};

export const createCheckout = async () => {
  try {
    return await client.checkout.create();
  } catch {
    return null;
  }
};

export const addItemToCheckout = async (checkoutId: string, lineItems: any[]) => {
  try {
    return await client.checkout.addLineItems(checkoutId, lineItems);
  } catch {
    return null;
  }
};

export default client;
