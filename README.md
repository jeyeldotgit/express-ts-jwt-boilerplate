# Grindset Server

Express.js + TypeScript backend server.

## Project Structure

```
server/
├── src/
│   ├── config/          # Configuration files (database, environment variables)
│   ├── controllers/     # Business logic (handles requests/responses)
│   ├── models/          # Database models & schemas
│   ├── routes/          # API route definitions
│   ├── middlewares/     # Custom middleware (authentication, logging, error handling)
│   ├── services/        # Business logic or external API interactions
│   ├── utils/           # Helper functions and utilities
│   ├── app.ts           # Express app setup
│   └── server.ts        # Server initialization
├── .env                 # Environment variables
├── .gitignore           # Files to ignore in version control
├── package.json         # Dependencies and scripts
└── README.md            # Project documentation
```

## Getting Started

### Installation

```bash
npm install
```

### Development

Run the server in development mode with hot-reload:

```bash
npm run dev
```

### Build

Compile TypeScript to JavaScript:

```bash
npm run build
```

### Production

Start the production server:

```bash
npm start
```

## Environment Variables

Copy `.env` and configure the following variables:

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `DATABASE_URL` - Database connection string (when ready)
- `JWT_SECRET` - JWT secret key (when implementing authentication)

## Scripts

- `npm run dev` - Start development server with hot-reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Type check without emitting files

