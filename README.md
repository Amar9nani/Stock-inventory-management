# Supermarket Stock Management System

A comprehensive web application for managing supermarket inventory, tracking stock levels, analyzing sales data, and processing transactions in Indian Rupees (₹).

## Features

- **User Authentication**
  - Secure login and registration system
  - Role-based access control (Admin and User roles)
  - Session management with Express session

- **Product Management**
  - Add, edit, and delete products
  - Filter and sort products by category, stock status, and name
  - Export product data to CSV

- **Inventory Tracking**
  - Real-time stock level monitoring
  - Low stock alerts and notifications
  - Stock overview dashboard

- **Sales Analytics**
  - Interactive charts and visualizations
  - Daily sales trends
  - Top-selling products

- **Transaction Management**
  - Process sales, returns, and restocks
  - Transaction history with filtering
  - Revenue tracking in Indian Rupees (₹)

- **User Management** (Admin only)
  - View all system users
  - Delete user accounts
  - Role management

- **Responsive Design**
  - Mobile-friendly interface
  - Adapts to tablets and desktops
  - Modern UI with shadcn components

## Technology Stack

- **Frontend**
  - React.js with TypeScript
  - TanStack Query for data fetching
  - Recharts for data visualization
  - Tailwind CSS for styling
  - Shadcn UI components

- **Backend**
  - Node.js with Express
  - In-memory database (configured for MongoDB)
  - RESTful API architecture
  - Authentication with Passport.js and bcrypt
  - Session management with express-session
## Setup and Installation

### Prerequisites
- Node.js (v18.x or later)
- npm or yarn package manager
- Git (for cloning the repository)

### Local Development Setup

1. Clone the repository
2. Install dependencies
3. Set up environment variables
4. Start the development server
5. Access the application at http://localhost:5000

## Authentication

### Default Admin Credentials
- **Username**: Amarnadh
- **Password**: Amar.nadi@2004

### User Roles
- **Admin**: Full access to all features including user management
- **User**: Access to products, transactions, and analytics, but cannot manage users

## Database Structure

The application uses a structured database with the following main collections:

1. **Products**
   - id: Unique identifier
   - name: Product name
   - category: Product category (Dairy, Bakery, Produce, etc.)
   - price: Price in Indian Rupees (₹)
   - stockQuantity: Current inventory level
   - itemsSold: Total number of units sold

2. **Transactions**
   - id: Unique identifier
   - productId: Reference to the product
   - quantity: Number of units in the transaction
   - totalPrice: Transaction amount in Indian Rupees (₹)
   - type: Transaction type (sale, restock, return)
   - date: Date of transaction

3. **Users**
   - id: Unique identifier
   - username: User's username
   - password: Hashed password using bcrypt
   - email: User's email address
   - role: User role (admin or user)

## API Endpoints

### Authentication
- POST /api/register - Register a new user
- POST /api/login - Login user
- POST /api/logout - Logout user
- GET /api/user - Get current user information

### Products
- GET /api/products - Get all products
- GET /api/products/:id - Get specific product
- POST /api/products - Create new product (Admin only)
- PUT /api/products/:id - Update product (Admin only)
- DELETE /api/products/:id - Delete product (Admin only)

### Transactions
- GET /api/transactions - Get all transactions
- POST /api/transactions - Create new transaction

### Analytics
- GET /api/stock - Get stock overview
- GET /api/analytics/sales - Get sales data
- GET /api/analytics/top-products - Get top-selling products

### User Management
- GET /api/users - Get all users (Admin only)
- DELETE /api/users/:id - Delete user (Admin only)

## Responsive Design

The application is fully responsive with adaptive layouts for:
- Mobile devices (< 640px)
- Tablets (640px - 1024px)
- Desktops (> 1024px)

## Deployment

### Full-Stack Deployment to Vercel
1. Create a Vercel account at [vercel.com](https://vercel.com)
2. Connect your GitHub repository
3. Configure environment variables:
   - SESSION_SECRET=your-secure-session-secret
   - NODE_ENV=production
4. Configure project settings:
   - In the Vercel dashboard, select your project
   - Go to Settings → General → Build & Development Settings
   - Set Framework Preset to "Vite"
   - Build Command: `npm run build`
   - Output Directory: `client/dist`
5. Deploy the project
6. Once deployed, Vercel will provide a production URL that hosts both your frontend and API

### Alternative: Split Deployment

#### Frontend (Vercel)
1. Create a Vercel account at [vercel.com](https://vercel.com)
2. Connect your GitHub repository
3. Configure environment variables:
   - VITE_API_URL=https://your-backend-url.com/api
4. Deploy the project

#### Backend (Render)
1. Create a Render account at [render.com](https://render.com)
2. Create a new Web Service
3. Connect your GitHub repository
4. Configure environment variables:
   - NODE_ENV=production
   - SESSION_SECRET=your-secret-key
   - PORT=5000
   - CORS_ORIGIN=https://your-frontend-vercel-url.vercel.app
5. Deploy the service

### Important Deployment Notes
- The project includes a `vercel.json` configuration file that sets up routing for the combined frontend/backend deployment
- For Vercel deployment, cookies and authentication are configured to work across serverless functions
- CORS settings are automatically configured to work with Vercel's domain structure

## Contact

For support or inquiries, please contact:
- Email: namarnadh.9@gmail.com

## License

This project is licensed under the MIT License.
