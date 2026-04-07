# CODECRAFTERS🏫
> Welcome Learners

CodeCrafters is a two-player collaborative educational game that teaches Python programming through a story-driven experience. Players work together to build a virtual school campus — one writes the code, both see the result.

## What is it?

CodeCrafters pairs two players as an **Architect** and a **Builder**. Each stage presents a Python coding challenge tied to a campus building — solve it correctly and the building goes up. Both players must complete their respective tasks before the stage advances, making collaboration the core mechanic rather than an afterthought.

Concepts covered across the five stages include variables, input/output, conditionals, and functions.

## Tech Stack

This project uses a modern web stack for a real-time, interactive experience.

*   **Backend:**
    *   **Node.js (v20+):** A JavaScript runtime for building fast and scalable server-side applications.
    *   **Express.js:** A minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.
    *   **Socket.IO:** Enables real-time, bidirectional and event-based communication between the client and the server. It's crucial for the collaborative features of the game.
    *   **PostgreSQL:** A powerful, open-source object-relational database system used for persisting game state and user data.

*   **Frontend:**
    *   **Next.js (v14+):** A React framework for building server-side rendered and static web applications. We use the App Router for routing and layouts.
    *   **React (v18+):** A JavaScript library for building user interfaces, used for creating reusable UI components.
    *   **TypeScript:** A typed superset of JavaScript that compiles to plain JavaScript, enhancing code quality and maintainability.
    *   **Tailwind CSS:** A utility-first CSS framework for rapidly building custom user interfaces.

*   **Infrastructure:**
    *   **Docker & Docker Compose:** For containerizing the application and its services (like the database) for consistent development and deployment environments.

## File Structure

The repository is organized into two main parts: `client` and `server`.

```
.
├── client/                 # Next.js frontend application
│   ├── app/                # Next.js App Router: contains all pages and layouts
│   │   ├── (auth)/         # Route group for authentication pages (login, signup)
│   │   ├── game/           # Main game view
│   │   ├── lobby/          # Game lobby for joining/creating games
│   │   └── layout.tsx      # Root layout for the entire application
│   ├── components/         # Reusable React components
│   │   ├── game/           # Components specific to the game UI
│   │   └── campus/         # Components for the campus view
│   ├── lib/                # Utility functions and context providers
│   │   ├── auth.ts         # Authentication-related functions
│   │   └── game-context.tsx # React Context for managing game state
│   └── public/             # Static assets like images
├── server/                 # Node.js backend server
│   ├── db/                 # Database connection and query helpers
│   │   ├── postgres.js     # PostgreSQL connection setup
│   │   └── session.js      # In-memory session management
│   ├── middleware/         # Express middleware (e.g., for authentication)
│   ├── routes/             # API route definitions
│   │   ├── auth.js         # Authentication routes
│   │   ├── game.js         # Game management routes
│   │   └── code.js         # Code execution route
│   ├── socket/             # Socket.IO event handlers
│   └── server.js           # Main server entry point (Express + Socket.IO setup)
├── Dockerfile              # Dockerfile for building the server image
└── docker-compose.yml      # Docker Compose configuration for all services
```

## Architectural and Coding Patterns

To ensure the codebase is maintainable and scalable, we follow these patterns:

*   **Frontend (Client):**
    *   **Component-Based Architecture:** The UI is built using reusable React components, located in `client/components`.
    *   **State Management:** Global game state is managed using React's Context API (`client/lib/game-context.tsx`). This avoids prop-drilling and provides a single source of truth for the game state on the client.
    *   **Routing:** We use the Next.js App Router for file-based routing. Route groups like `(auth)` are used to organize related pages without affecting the URL structure.
    *   **Styling:** We use a combination of global styles (`client/app/globals.css`) and Tailwind CSS for utility-first styling within components.

*   **Backend (Server):**
    *   **RESTful API:** The backend exposes a RESTful API for actions like creating/joining games and running code. Routes are defined in the `server/routes` directory.
    *   **MVC-like Structure:** The backend follows a pattern similar to Model-View-Controller:
        *   **Routes (Controllers):** Express route handlers in `server/routes` act as controllers, handling incoming requests.
        *   **Database (Model):** Database interaction logic is abstracted in `server/db`, acting as the model layer.
    *   **Real-time Communication:** Socket.IO is used for real-time events. Event handlers are organized in `server/socket/handlers.js`. This is used for actions that need to be pushed to clients, like player joins or game state updates.
    *   **Middleware:** Express middleware in `server/middleware` is used for cross-cutting concerns like authentication.

*   **General:**
    *   **TypeScript:** We use TypeScript in the frontend (`client`) to enforce type safety, which helps catch errors early and improves developer experience.
    *   **ESLint:** A linter is configured (`client/eslint.config.mjs`) to enforce a consistent code style and identify potential issues.
    *   **Environment Variables:** Configuration is managed through environment variables (e.g., `DATABASE_URL`), following the twelve-factor app methodology.


## Prerequisites

- Node.js 20+
- npm 10+
- Docker Desktop (for containerized setup)

## Quick Start (Docker)

This is the easiest way to run the app with PostgreSQL.

```bash
docker compose up --build
```

App URL:

- http://localhost:3000

Stop services:

```bash
docker compose down
```

Remove volumes (reset database):

```bash
docker compose down -v
```

## Local Development (Without Docker)

1. Install dependencies:

```bash
npm install
```

2. Start PostgreSQL locally and create a database named codecrafters.

3. Set environment variables in a .env file at the repository root:

```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/codecrafters
```

4. Run the development server:

```bash
npm run dev
```

## API Overview

Base URL: http://localhost:3000

- POST /api/game/create
    - Body: { "playerName": "Alice" }
- POST /api/game/join
    - Body: { "sessionId": "AB12CD34", "playerName": "Bob" }
- GET /api/game/:sessionId
- POST /api/code/run
    - Body: { "source_code": "print('hi')", "expected_output": "hi" }

## Socket.IO

Socket.IO is initialized on the same HTTP server as Express.

- Default CORS is currently open for development.
- Event handlers are defined in server/socket/handlers.js.

## Scripts

Root scripts:

- npm run dev: Starts server with nodemon
- npm start: Starts server with node

Client scripts (inside client):

- npm run dev
- npm run build
- npm run start
- npm run lint

## Notes

- The backend currently serves static files from client/public.
- The Next.js workspace under client is available for modern frontend development and iteration.

## Team

Built for CSI 680 — Spring 2026 at the University at Albany.

| Name | GitHub |
|---|---|
| Srinivas Mekala | [@sri-nivas1227](https://github.com/sri-nivas1227) |
| Sai Satwik Bikumandla | [@SaisatwikBiku](https://github.com/SaisatwikBiku) |
| Mehak Seth | [@Mehak005](https://github.com/Mehak005) |
| Dileep Reddy Chinneluka | [@Dileepreddy-01](https://github.com/Dileepreddy-01) |

Advised by **Jeff Offutt**.
