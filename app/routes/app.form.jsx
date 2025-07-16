import { useState } from "react";
import { useFetcher } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  TextField,
  Select,
  Form,
  FormLayout,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  
  const title = formData.get("title");
  const description = formData.get("description");
  const price = formData.get("price");
  const category = formData.get("category");
  
  // Validate required fields
  if (!title || !price) {
    return {
      success: false,
      error: "Title and price are required"
    };
  }

  // Validate price is a valid number
  const priceNumber = parseFloat(price);
  if (isNaN(priceNumber) || priceNumber < 0) {
    return {
      success: false,
      error: "Price must be a valid positive number"
    };
  }
  
  try {
    // Save to local database first
    const localProduct = await db.product.create({
      data: {
        title: title,
        description: description || "",
        price: priceNumber,
        category: category || "electronics",
        shopifyId: null, // Will update this after Shopify creation
      },
    });

    // Create product in Shopify with minimal required fields
    const response = await admin.graphql(
      `#graphql
        mutation productCreate($input: ProductInput!) {
          productCreate(input: $input) {
            product {
              id
              title
              status
            }
            userErrors {
              field
              message
            }
          }
        }`,
      {
        variables: {
          input: {
            title: title,
          },
        },
      }
    );

    const responseJson = await response.json();
    
    // Check for GraphQL errors
    if (responseJson.data?.productCreate?.userErrors?.length > 0) {
      const errors = responseJson.data.productCreate.userErrors;
      return {
        success: false,
        error: `Shopify error: ${errors.map(e => e.message).join(', ')}`
      };
    }

    const shopifyProduct = responseJson.data?.productCreate?.product;
    
    // Update local product with Shopify ID if successful
    if (shopifyProduct?.id) {
      await db.product.update({
        where: { id: localProduct.id },
        data: { shopifyId: shopifyProduct.id },
      });
    }

    return {
      success: true,
      product: shopifyProduct,
      localProduct: localProduct
    };
  } catch (error) {
    console.error("Error creating product:", error);
    return {
      success: false,
      error: `Database error: ${error.message}`
    };
  }
};

export default function FormPage() {
  const fetcher = useFetcher();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("electronics");

  const isLoading = fetcher.state === "submitting";

  const handleSubmit = () => {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("category", category);
    
    fetcher.submit(formData, { method: "POST" });
  };

  const categoryOptions = [
    { label: "Electronics", value: "electronics" },
    { label: "Clothing", value: "clothing" },
    { label: "Home & Garden", value: "home-garden" },
    { label: "Sports", value: "sports" },
    { label: "Books", value: "books" },
  ];

  return (
    <Page>
      <TitleBar title="Product Form" />
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="500">
              <Text as="h2" variant="headingMd">
                Create New Product
              </Text>
              
              {fetcher.data?.success && (
                <Card background="bg-surface-success">
                  <Text as="p" variant="bodyMd">
                    ✅ Product "{fetcher.data.product.title}" created successfully in Shopify and saved to local database!
                  </Text>
                </Card>
              )}

              {fetcher.data?.success === false && (
                <Card background="bg-surface-critical">
                  <Text as="p" variant="bodyMd">
                    ❌ Error: {fetcher.data.error}
                  </Text>
                </Card>
              )}

              <FormLayout>
                <TextField
                  label="Product Title"
                  value={title}
                  onChange={setTitle}
                  placeholder="Enter product title"
                  autoComplete="off"
                />

                <TextField
                  label="Description"
                  value={description}
                  onChange={setDescription}
                  placeholder="Enter product description"
                  multiline={4}
                  autoComplete="off"
                />

                <TextField
                  label="Price"
                  value={price}
                  onChange={setPrice}
                  placeholder="0.00"
                  prefix="$"
                  type="number"
                  step="0.01"
                  autoComplete="off"
                />

                <Select
                  label="Category"
                  options={categoryOptions}
                  value={category}
                  onChange={setCategory}
                />

                <Button
                  primary
                  loading={isLoading}
                  onClick={handleSubmit}
                  disabled={!title || !price}
                >
                  {isLoading ? "Creating Product..." : "Create Product"}
                </Button>
              </FormLayout>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="200">
              <Text as="h3" variant="headingMd">
                Form Instructions
              </Text>
              <Text as="p" variant="bodyMd">
                Fill out the form to create a new product in your Shopify store.
              </Text>
              <Text as="p" variant="bodyMd">
                • Title and Price are required fields
                • Description helps customers understand your product
                • Category helps organize your products
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}