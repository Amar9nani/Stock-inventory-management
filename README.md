# Supermarket Stock Management System

A comprehensive web application for managing supermarket inventory, tracking stock levels, analyzing sales data, and processing transactions in Indian Rupees (₹).

## Key Features

- **Product Management**: Add, edit, and delete products with detailed information
- **Inventory Tracking**: Monitor stock levels in real-time with low stock alerts
- **Sales Analytics**: Track sales trends and identify top-selling products
- **Transactions**: Process sales, returns, and restocks with complete history
- **User Management**: Role-based access with admin and regular user privileges
- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop devices

## Technology Stack

- **Frontend**: React.js, TypeScript, TanStack Query, Shadcn UI, Tailwind CSS
- **Backend**: Node.js, Express, RESTful API
- **Authentication**: JWT-based auth with secure password hashing
- **Storage**: In-memory database with MongoDB-compatible schema

## Quick Start

### Admin Credentials
- **Username**: Amarnadh
- **Password**: Amar.nadi@2004

### Local Development
1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Access the application at http://localhost:5000

## Deployment to Vercel

1. Fork/Clone this repository to your GitHub account
2. Connect to Vercel and select the repository
3. Configure the build settings:
   - Build Command: `./build.sh`
   - Output Directory: `dist/public`
4. Add environment variables:
   - JWT_SECRET=[your-secret-key]
   - NODE_ENV=production
5. Deploy the project

## Troubleshooting Vercel Deployment

If you encounter the "FUNCTION_INVOCATION_FAILED" error:
1. Ensure Vercel functions have enough memory (at least 1024MB)
2. Check that JWT_SECRET environment variable is set
3. Verify CORS settings in vercel.json are correct
4. If using a custom domain, update CORS settings to allow requests from that domain

## Contact

For support or inquiries, please contact:
- Email: namarnadh.9@gmail.com

## License

This project is licensed under the MIT License.
