# Shopify Theme Extension App - Form Data Display

A complete Shopify app that demonstrates how to collect data through admin forms and display it in the online store using theme extensions and app proxy.

## 🚀 Features

- **Admin Form Interface**: Collect product data through a user-friendly form in the Shopify admin
- **Theme Extension**: Display form data directly in the online store
- **App Proxy**: Secure communication between storefront and app backend
- **Dual Storage**: Data stored in both app database and Shopify store
- **Real-time Console Logging**: Automatic logging of form data in browser console
- **No App Bridge in Theme Extension**: Proper separation of admin and storefront functionality

## 📁 Project Structure

```
app-for-api-shopif/
├── app/
│   ├── routes/
│   │   ├── app.form.jsx           # Admin form for data collection
│   │   ├── api.product-data.js    # Internal API route
│   │   └── apps.product-data.js   # App proxy route for storefront
│   ├── db.server.js               # Database connection
│   └── shopify.server.js          # Shopify API configuration
├── extensions/
│   └── api-check/
│       ├── blocks/
│       │   └── custom-product-block.liquid  # Theme extension block
│       └── shopify.extension.toml
├── prisma/
│   ├── schema.prisma              # Database schema
│   └── migrations/                # Database migrations
├── shopify.app.toml               # App configuration with proxy
└── package.json
```

## 🔧 Key Components

### 1. Admin Form (`app/routes/app.form.jsx`)
- Collects product data (title, description, price, category)
- Saves to local database AND creates Shopify product
- Links local data with Shopify product ID

### 2. Theme Extension (`extensions/api-check/blocks/custom-product-block.liquid`)
- Displays on storefront (no App Bridge)
- Fetches all form data via app proxy
- Logs detailed information to browser console
- Shows visual product cards

### 3. App Proxy (`app/routes/apps.product-data.js`)
- Enables storefront to access app data
- Configured in `shopify.app.toml`
- Handles `/apps/product-data` requests from storefront

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+
- Shopify CLI
- Shopify Partner account
- Development store

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/iammdsufiyan/theme-extension-app.git
   cd theme-extension-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Configure Shopify app**
   ```bash
   shopify app generate
   # Follow prompts to connect to your Partner account
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## 📋 Usage

### Creating Form Data

1. **Access Admin Panel**
   - Go to your development store admin
   - Navigate to Apps → Your App
   - Click on "Product Form"

2. **Fill Out Form**
   - Enter product title (required)
   - Add description
   - Set price (required)
   - Select category
   - Click "Create Product"

3. **Verification**
   - Product appears in Shopify admin
   - Data saved to app database
   - Success message displayed

### Viewing Data in Online Store

1. **Add Theme Extension**
   - Go to Online Store → Themes
   - Click "Customize" on active theme
   - Add "Form Data Display Block" to any page
   - Save theme

2. **View Results**
   - Visit your online store
   - Open Developer Tools (F12)
   - Check Console tab
   - See detailed logs of all form data

## 🔄 Data Flow

```
Admin Form → App Database → Shopify Store
     ↓
Theme Extension ← App Proxy ← Storefront Request
     ↓
Console Logging + Visual Display
```

## 🎯 Console Output Example

```javascript
🎉 Form Data Display Block Loaded!
🌍 Current URL: https://yourstore.myshopify.com/
🏪 Shop Domain: yourstore.myshopify.com
📅 Timestamp: 2025-07-16T11:16:08.655Z
🌐 Fetching all form data from your app...
✅ SUCCESS! Form data received: {...}
📦 Found 15 products from your form:

--- Product 1 ---
🆔 ID: cmd5v8cb20002ygmpfs2pgvgk
📝 Title: "My Product"
📄 Description: "Product description"
💰 Price: 29.99
🏷️ Category: "electronics"
🔗 Shopify ID: gid://shopify/Product/14758272434543
📅 Created: 2025-07-16T11:16:08.655Z
```

## 🔐 App Proxy Configuration

The app proxy is configured in `shopify.app.toml`:

```toml
[app_proxy]
url = "https://your-app-url.com/apps/product-data"
subpath = "product-data"
prefix = "apps"
```

This allows storefront requests to `/apps/product-data` to be forwarded to your app.

## 🗄️ Database Schema

```prisma
model Product {
  id          String   @id @default(cuid())
  title       String
  description String?
  price       Float
  category    String
  shopifyId   String?  // Links to Shopify product
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## 🚀 Deployment

1. **Deploy Extension**
   ```bash
   shopify app deploy
   ```

2. **Install in Store**
   - Go to your store admin
   - Install the app
   - Configure theme extension

3. **Production Setup**
   - Update `shopify.app.toml` with production URLs
   - Set up production database
   - Configure environment variables

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues:

1. Check the console logs for detailed error information
2. Verify app proxy configuration
3. Ensure theme extension is properly installed
4. Check database connection and migrations

## 🔗 Related Documentation

- [Shopify App Development](https://shopify.dev/docs/apps)
- [Theme Extensions](https://shopify.dev/docs/apps/online-store/theme-app-extensions)
- [App Proxy](https://shopify.dev/docs/apps/online-store/app-proxies)
- [Remix Framework](https://remix.run/docs)

---

**Built with ❤️ using Shopify, Remix, and Prisma**
