# Collaborative Task Management Web App

Full-stack task management application for teams with:

- JWT authentication
- PostgreSQL relational schema
- Project membership and RBAC
- Dashboard insights
- Kanban and list task views

## Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: PostgreSQL

## Project Structure

```text
client/   React application
server/   Express API and PostgreSQL integration
```

## Setup

### 1. Create the database schema

Run the SQL in [server/database/schema.sql](/d:/Aditya/Koding/Task%20Manager%20Dashoard/server/database/schema.sql).

### 2. Configure environment variables

Backend env:

```bash
cp server/.env.example server/.env
```

Frontend env:

```bash
cp client/.env.example client/.env
```

### 3. Install dependencies

```bash
npm install
npm --prefix server install
npm --prefix client install
```

### 4. Start the apps

Backend:

```bash
npm run dev:server
```

Frontend:

```bash
npm run dev:client
```

## RBAC Summary

- `ADMIN` can manage projects, members, and all tasks.
- `MEMBER` can view project tasks and create tasks.
- `MEMBER` can edit a task only if they created it or it is assigned to them.
- `MEMBER` can change task status only if the task is assigned to them.
- `MEMBER` can delete only tasks they created.

## Deployment Notes

- Backend is ready for Railway-style `DATABASE_URL` and `JWT_SECRET`.
- Frontend reads `VITE_API_URL`.

