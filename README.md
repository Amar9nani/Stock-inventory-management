# Supermarket Stock Management System

A comprehensive web application for managing supermarket inventory, tracking stock levels, analyzing sales data, and processing transactions in Indian Rupees (₹).

## Features

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

