import { json } from "@remix-run/node";
import db from "../db.server.js";

export async function loader({ request }) {
  const url = new URL(request.url);
  const productId = url.searchParams.get("product_id");

  console.log("API: Request received");
  console.log("API: Product ID:", productId);
  console.log("API: Full URL:", url.toString());

  // If no product ID is provided, return all products
  if (!productId) {
    console.log("API: No product ID provided, returning all products");
    const allProducts = await db.product.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    console.log("API: Found", allProducts.length, "total products");
    allProducts.forEach((product, index) => {
      console.log(`API: Product ${index + 1}:`, {
        id: product.id,
        title: product.title,
        shopifyId: product.shopifyId,
        createdAt: product.createdAt
      });
    });

    return json({
      success: true,
      allProducts: allProducts,
      totalCount: allProducts.length,
      message: "All products from your form"
    });
  }

  // If product ID is provided, find specific product
  console.log("API: Looking for specific product with ID:", productId);

  // Try to find product by exact shopifyId match first
  let product = await db.product.findFirst({
    where: { shopifyId: productId },
  });

  // If not found, try with GraphQL format
  if (!product) {
    const graphqlId = `gid://shopify/Product/${productId}`;
    console.log("API: Trying GraphQL format:", graphqlId);
    product = await db.product.findFirst({
      where: { shopifyId: graphqlId },
    });
  }

  // If still not found, try to find by numeric ID at the end of GraphQL format
  if (!product) {
    console.log("API: Trying to find by numeric ID in GraphQL format");
    const products = await db.product.findMany();
    product = products.find(p =>
      p.shopifyId && p.shopifyId.endsWith(`/${productId}`)
    );
  }

  console.log("API: Found specific product:", product ? "YES" : "NO");

  if (!product) {
    const allProducts = await db.product.findMany();
    console.log("API: Product not found, returning all products as fallback");
    return json({
      error: "Specific product not found",
      searchedId: productId,
      allProducts: allProducts,
      message: "Showing all products instead"
    }, { status: 404 });
  }

  return json({
    success: true,
    product_id: product.shopifyId,
    title: product.title,
    description: product.description,
    price: product.price,
    category: product.category,
    createdAt: product.createdAt,
    debug: {
      searchedId: productId,
      foundShopifyId: product.shopifyId
    }
  });
}
