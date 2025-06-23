This is a [Next.js](https://nextjs.org) project (Katharos)

## Getting Started

Make sure you have the following tools installed:

- [Node.js](https://nodejs.org) (version 18 or later)
- [Git](https://git-scm.com)
- A package manager like [npm](https://www.npmjs.com/), [Yarn](https://yarnpkg.com/), [pnpm](https://pnpm.io/), or [bun](https://bun.sh/)


First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

The project structure is as follows:

### Root level:
```
├── .env - Environment variables for the project
├── .gitignore - Git ignore file
├── .next/ - Next.js build output directory (do not modify)
├── next-env.d.ts - Next.js environment types
├── next.config.ts - Next.js configuration file
├── package.json - Project metadata and dependencies
├── public/ - Static files served by Next.js
├── README.md - Project documentation
├── src/ - Source code directory
├── tsconfig.json - TypeScript configuration file
```

### Source Code Directory (`src/`):
```
├── app/ - Contains Next.js application-level files like `layout.tsx` and route-specific components
│   ├── layout.tsx - Root layout for the application
│   └── ... - Other route-specific folders and pages (e.g., `app/api/`, `app/login/`, `app/productos/`)
|
├── features/ - Encapsulates feature-specific logic and modules
│   ├── admin/ - Admin-related functionality
│   │   ├── repositories/ - Data repositories for admin features
│   │   ├── services/ - Admin services (calls to repository)
│   │   └── utils/ - Utility functions for admin features
│   ├── auth/ - Authentication-related functionality
│   │   ├── hooks/ - Custom hooks for authentication
│   │   ├── repositories/ - Data repositories for authentication
│   │   |── services/ - Authentication services (calls to repository)
|   |   |── types/ - Type definitions for authentication
│   |   └── utils/ - Utility functions for authentication
│   └── products/ - Product-related functionality
│       ├── repositories/ - Data repositories for products
│       ├── services/ - Product services (calls to repository)
│       |── types/ - Type definitions for products
│       └── utils/ - Utility functions for products
|
├── lib/ - Contains shared libraries and utilities
│   ├── firebase.ts - Firebase configuration and utilities
|
├── shared/ - Shared components, utilities, and types used across the project
│   |── components/ - Reusable UI components
|   ├── types/ - Type definitions shared across the project
│   └── utils/ - Utility functions shared across the project
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Next Steps

Development is still required for the following features:

- [ ] Implement individual product pages (by ID)
  - Detailed product page (with images, description, price, etc.)
  - Implement as a component for reusability in admin dashboard product creation/update

- [ ] Implement product management features (CRUD operations)
  - Product creation (on admin dashboard)
  - Product update (on admin dashboard)
  - Product retrieval (by ID or filters)
  - Product deletion (on admin dashboard)

- [ ] Implement cart management features
  - Add products to cart
  - Update product quantities in cart
  - Remove products from cart

- [ ] Implement checkout
  - Create order summary page
  - Implement payment processing (first, Yape/Plin, then Stripe or similar)
  - Order confirmation page (and email notification)

- [ ] Implement user authentication (almost done)
  - Don't register automatically when logging in
  - User registration with OAuth (Facebook and Apple)