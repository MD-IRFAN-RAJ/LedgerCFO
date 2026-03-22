# LedgerCFO

LedgerCFO is a full-stack client and compliance task tracker.
It has a React frontend and a Node.js/Express backend with MongoDB.

## Project Architecture

### High-level flow

1. The frontend calls backend REST APIs through Axios.
2. The backend validates and processes requests with Express routes.
3. Mongoose models read and write data in MongoDB.
4. Responses return to the frontend, where React Query refreshes UI state.

### Tech stack

- Frontend: React, Vite, Tailwind CSS, React Query, Axios, React Router
- Backend: Node.js, Express, Mongoose, dotenv, CORS
- Database: MongoDB Atlas or local MongoDB

### Folder structure

```
LedgerCFO/
  backend/
    models/
      Client.js
      Task.js
    routes/
      clientRoutes.js
      taskRoutes.js
    server.js
    seed.js
    .env.example
  frontend/
    src/
      pages/
        Clients.jsx
        Tasks.jsx
      services/
        api.js
        clientService.js
        taskService.js
      components/
    .env.example
```

### Backend modules

- server.js
  - Sets up Express app, CORS, JSON middleware
  - Connects MongoDB via MONGO_URI
  - Mounts routes under /api/clients and /api/tasks
- routes/clientRoutes.js
  - GET /api/clients
  - POST /api/clients
- routes/taskRoutes.js
  - GET /api/tasks?clientId=<id>
  - POST /api/tasks
  - PATCH /api/tasks/:id
- models/Client.js and models/Task.js
  - Define MongoDB schema and collection behavior

### Frontend modules

- src/services/api.js
  - Axios instance with base URL from VITE_API_BASE_URL
- src/services/clientService.js and taskService.js
  - API wrappers used by React Query
- src/pages/Clients.jsx
  - Client listing, filtering, add-client flow
- src/pages/Tasks.jsx
  - Task listing and status update flow per client

## Step-by-step Setup Guide

### 1. Prerequisites

Install these first:

- Node.js 18+ (Node.js 20 recommended)
- npm 9+
- MongoDB Atlas connection string or local MongoDB server
- Git (optional but recommended)

### 2. Clone and open project

```bash
git clone <your-repository-url>
cd LedgerCFO
```

### 3. Setup backend

```bash
cd backend
npm install
```

Create backend env file:

- Copy backend/.env.example to backend/.env
- Update values in backend/.env

Required backend env variables:

- PORT=5000
- MONGO_URI=your_mongodb_connection_string
- FRONTEND_URL=http://localhost:5173
- BACKEND_URL=http://localhost:5000

Start backend:

```bash
npm run dev
```

Or:

```bash
npm start
```

### 4. Setup frontend

Open a new terminal:

```bash
cd frontend
npm install
```

Create frontend env file:

- Copy frontend/.env.example to frontend/.env
- Update values in frontend/.env

Required frontend env variables:

- VITE_FRONTEND_URL=http://localhost:5173
- VITE_BACKEND_URL=http://localhost:5000
- VITE_API_BASE_URL=http://localhost:5000/api

Start frontend:

```bash
npm run dev
```

### 5. Verify application

1. Open the frontend URL shown by Vite (usually http://localhost:5173).
2. Confirm clients list loads.
3. Add a new client from the Clients page.
4. Open a client and verify task operations.

## Optional: Seed sample data

The backend has a seed script for sample clients.

```bash
cd backend
node seed.js
```

Important:

- seed.js currently clears existing client records before inserting sample data.
- Use it only when you are okay replacing current client collection content.

## API Summary

### Clients

- GET /api/clients
- POST /api/clients

Example POST body:

```json
{
  "company_name": "Acme Pvt Ltd",
  "country": "India",
  "entity_type": "Private Limited",
  "govt_id": "29ABCDE1234F1Z5",
  "govt_id_type": "GSTIN"
}
```

### Tasks

- GET /api/tasks?clientId=<client-id>
- POST /api/tasks
- PATCH /api/tasks/:id

## Troubleshooting

### Backend exits immediately

- Check backend/.env exists and MONGO_URI is valid.
- Ensure MongoDB user has access to the target database.
- Ensure PORT is not already in use.

### Frontend cannot reach backend

- Confirm VITE_API_BASE_URL points to backend API, for example http://localhost:5000/api.
- Confirm backend is running.
- Confirm CORS FRONTEND_URL matches your frontend origin.

### Duplicate govt_id error while adding client

- govt_id is unique in client model.
- Use a new govt_id or leave govt_id empty.

## Recommended next improvements

- Add centralized backend error middleware.
- Add request validation with a schema library.
- Add automated tests for routes and UI.
- Add Docker setup for one-command local startup.
