# 2237104 Aditya Chaurasia

## Task Orbit - Collaborative Task Management Dashboard

Task Orbit is a collaborative task management application designed for modern teams. It provides a centralized workspace to plan, prioritize, and track tasks across multiple projects with real-time updates and a premium user interface.

## Key Features

### 1. Unified Dashboard
An overview of your workspace performance. It includes dynamic stat cards for Total, Ended, Running, and Pending projects, along with a personalized task queue and recent activity feed.

### 2. Multi-Project Management
Organize work into distinct projects. Each project acts as an independent workspace with its own set of tasks, members, and progress metrics.

### 3. Task Boards (List and Kanban)
Switch between a structured list view and a visual Kanban board. The Kanban board supports drag-and-drop status updates for intuitive workflow management.

### 4. Role-Based Access Control
Detailed permission system with Admin and Member roles. Admins can manage project members, delete tasks, and modify project settings, while members focus on task execution.

### 5. Advanced Task Filtering
Powerful search and filtering system that allows users to find tasks by title, status, priority, or assignee across the entire dashboard or within specific projects.

### 6. Interactive Task Modals
Create and update tasks with detailed metadata including descriptions, priorities (Low, Medium, High), due dates, and assignees. The system ensures date formatting consistency for reliable deadline tracking.

### 7. Team Management
View and manage team members within each project. The dashboard also features an active members list showing who is currently assigned to ongoing tasks.

### 8. Premium UI/UX
Built with a focus on aesthetics and usability. Features include glassmorphism effects, smooth transitions, circular avatars with leakage protection, and a responsive design that adapts to various screen sizes.

## Technology Stack

- Frontend: React.js, Vite, Vanilla CSS
- Backend: Node.js, Express.js
- Database: PostgreSQL
- Authentication: JSON Web Tokens (JWT)
- Icons: Lucide React

## Local Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- Git

### 1. Clone the Repository
```bash
git clone <repository-url>
cd task-manager-dashboard
```

### 2. Install Dependencies
Install dependencies for both the client and the server using the root command:
```bash
npm install
```

### 3. Environment Configuration
Create a .env file in the /server directory with the following variables:
```text
PORT=4000
DATABASE_URL=postgres://user:password@localhost:5432/task_orbit
JWT_SECRET=your_random_secret_key
CLIENT_URL=http://localhost:5173
```

### 4. Database Initialization
Use the provided SQL scripts to create the schema and populate dummy data:
```bash
# From the root directory
psql -d task_orbit -f server/database/schema.sql
psql -d task_orbit -f server/database/seed.sql
```
Alternatively, use the provided utility script:
```bash
node server/run_seed.js
```

### 5. Running the Application
Start both the client and server simultaneously from the root directory:
```bash
npm run dev:server
npm run dev:client
```
The frontend will be available at http://localhost:5173 and the backend at http://localhost:4000.

## Deployment on Railway

1. Connect your GitHub repository to Railway.
2. Add a PostgreSQL service in your Railway project.
3. Link the DATABASE_URL to your server service.
4. Set the necessary environment variables (JWT_SECRET, NODE_ENV=production).
5. Ensure the Start Command is set to 'npm start' for the production build.
