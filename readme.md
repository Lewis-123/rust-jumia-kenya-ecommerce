# Kenya Shop Ecommerce Web Application

A full-stack ecommerce web application built with TypeScript, Node.js, Express, MongoDB, EJS templates, custom CSS, and the Apify Jumia Kenya Scraper API.

The application has two main sections:

1. Public customer frontend for browsing products.
2. Secured admin backend for managing products and importing Kenyan market product data.

---

## Project Overview

Kenya Shop is a dynamic ecommerce web application that allows customers to browse products available in the Kenyan market. Product data can be added manually by an administrator or imported from Jumia Kenya using the Apify Jumia Kenya Scraper API.

The admin backend is protected with session-based authentication. Admin users can register, log in, add products, edit products, delete products, upload product images, import products, and manage the product catalogue.

---

## Main Features

### Public Frontend

- Homepage
- About page
- Shop page
- Single product page
- Contact page
- Product search
- Product category filtering
- Related products section
- Responsive layout
- Mobile navigation menu
- Custom CSS styling
- No Bootstrap
- No Tailwind CSS
- No jQuery

### Admin Backend

- Admin registration
- Admin login
- Admin logout
- Password hashing
- MongoDB-backed sessions
- Protected admin dashboard
- Product CRUD functionality
- Product image upload
- Product search and filtering in admin
- Product import from Jumia Kenya through Apify
- Dashboard statistics
- Recent products table
- Flash success and error messages

### Database Features

- MongoDB Atlas database connection
- Admin collection
- Product collection
- Contact message collection
- Session collection
- Unique admin emails
- Required product images
- Product validation before database storage

---

## Technologies Used

- TypeScript
- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- EJS
- Express EJS Layouts
- Express Session
- Connect Mongo
- BcryptJS
- Axios
- Multer
- Dotenv
- Custom CSS3
- Vanilla JavaScript ES6
- Apify Jumia Kenya Scraper API

---

## Project Structure

```text
typescript-jumia-kenya-ecommerce/
│
├── public/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── main.js
│   └── images/
│
├── src/
│   ├── config/
│   │   └── database.ts
│   │
│   ├── controllers/
│   │   ├── adminController.ts
│   │   ├── authController.ts
│   │   ├── productController.ts
│   │   └── publicController.ts
│   │
│   ├── middleware/
│   │   ├── authMiddleware.ts
│   │   ├── flashMiddleware.ts
│   │   └── uploadMiddleware.ts
│   │
│   ├── models/
│   │   ├── Admin.ts
│   │   ├── ContactMessage.ts
│   │   └── Product.ts
│   │
│   ├── routes/
│   │   ├── adminRoutes.ts
│   │   ├── authRoutes.ts
│   │   └── publicRoutes.ts
│   │
│   ├── services/
│   │   └── apifyService.ts
│   │
│   ├── types/
│   │   └── session.d.ts
│   │
│   ├── utils/
│   │   └── slugify.ts
│   │
│   └── server.ts
│
├── uploads/
│   └── .gitkeep
│
├── views/
│   ├── admin/
│   │   ├── add-product.ejs
│   │   ├── dashboard.ejs
│   │   ├── edit-product.ejs
│   │   ├── import-products.ejs
│   │   └── products.ejs
│   │
│   ├── pages/
│   │   ├── about.ejs
│   │   ├── contact.ejs
│   │   ├── home.ejs
│   │   ├── login.ejs
│   │   ├── not-found.ejs
│   │   ├── product.ejs
│   │   ├── register.ejs
│   │   └── shop.ejs
│   │
│   └── partials/
│       ├── cta.ejs
│       ├── footer.ejs
│       ├── header.ejs
│       └── layout.ejs
│
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
└── tsconfig.json