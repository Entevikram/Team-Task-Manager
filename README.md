# Fullstack Assessment Project

A full-stack project management application built with Next.js, React, PostgreSQL, and Prisma. Features authentication, project management, task tracking, and team collaboration.

## Tech Stack

### Backend
- **Next.js** - React framework for API routes
- **Prisma 7** - ORM with PostgreSQL adapter
- **PostgreSQL** - Database
- **JWT** - Authentication (via jose)
- **Zod** - Input validation

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool
- **TypeScript** - Language
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Recharts** - Charts
- **Lucide React** - Icons

## Project Structure

```
Fullstack_Assessment/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   │   ├── login/
│   │   │   ├── logout/
│   │   │   ├── me/
│   │   │   └── signup/
│   │   ├── dashboard/
│   │   ├── projects/      # Project management
│   │   └── tasks/        # Task management
│   └── dashboard/        # Dashboard page
├── frontend/             # React frontend
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/      # Page components
│   │   ├── services/   # API services
│   │   ├── hooks/      # Custom hooks
│   │   ├── context/    # React context
│   │   └── types/      # TypeScript types
│   └── public/         # Static assets
├── lib/                 # Shared library code
│   ├── auth.ts         # JWT authentication
│   ├── prisma.ts      # Prisma client
│   ├── validators.ts   # Zod validators
│   └── constants.ts    # App constants
└── prisma/             # Database
    ├── schema.prisma   # Database schema
    └── seed.ts       # Seed data
```

## Features

### Authentication
- User registration and login
- JWT-based authentication
- Role-based access (Admin, Member)
- Secure password hashing

### Dashboard
- Overview statistics
- Task distribution chart
- Recent tasks list
- Project metrics

### Projects
- Create, read, update, delete projects
- View project details
- Project member management

### Tasks
- Create tasks within projects
- Assign tasks to team members
- Track task status (TODO, IN_PROGRESS, DONE)
- Filter by status
- Due date tracking

### Team Members
- View project members
- Add/remove members
- Member roles

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd Fullstack_Assessment
```

2. **Install backend dependencies**
```bash
npm install
```

3. **Install frontend dependencies**
```bash
cd frontend
npm install
cd ..
```

4. **Configure environment variables**
Create a `.env` file in the root directory:
```env
DATABASE_URL=postgresql://user:password@host:port/database
NEXTAUTH_SECRET=your-secret-key
```

5. **Generate Prisma client**
```bash
npx prisma generate
```

6. **Push database schema**
```bash
npx prisma db push
```

7. **Seed the database**
```bash
npm run db:seed
```

### Running the Application

1. **Start the backend** (Terminal 1)
```bash
npm run dev
```
Backend runs at: http://localhost:3000

2. **Start the frontend** (Terminal 2)
```bash
cd frontend
npm run dev
```
Frontend runs at: http://localhost:5173

## Default Credentials

After seeding the database, you can log in with:

| Role    | Email               | Password    |
|--------|--------------------|-------------|
| Admin  | admin@example.com  | admin123   |
| Member | member1@example.com | member123  |

## API Endpoints

### Authentication
| Method | Endpoint      | Description          |
|--------|--------------|---------------------|
| POST   | /api/auth/login   | User login         |
| POST   | /api/auth/logout  | User logout       |
| POST   | /api/auth/signup | User registration |
| GET    | /api/auth/me     | Get current user |

### Projects
| Method | Endpoint                  | Description              |
|--------|--------------------------|------------------------|
| GET    | /api/projects           | List all projects       |
| POST   | /api/projects           | Create project        |
| GET    | /api/projects/:id       | Get project details  |
| PUT    | /api/projects/:id       | Update project     |
| DELETE | /api/projects/:id       | Delete project     |

### Tasks
| Method | Endpoint                           | Description                |
|--------|------------------------------------|----------------------------|
| GET    | /api/projects/:id/tasks        | List project tasks        |
| POST   | /api/projects/:id/tasks        | Create task          |
| PUT    | /api/tasks/:id                | Update task         |
| DELETE | /api/tasks/:id                | Delete task        |

### Team Members
| Method | Endpoint                           | Description                 |
|--------|------------------------------------|------------------------------|
| GET    | /api/projects/:id/members       | List project members        |
| POST   | /api/projects/:id/members      | Add member to project     |
| DELETE | /api/projects/:id/members/:userId | Remove member from project |

## User Roles

### Admin
- Create, edit, delete projects
- Create, edit, delete tasks
- Add/remove team members
- View all data

### Member
- View assigned projects
- View and update assigned tasks
- Cannot delete projects or tasks

## Database Schema

### User
- `id` - Unique identifier
- `name` - User's full name
- `email` - Unique email address
- `passwordHash` - Bcrypt hashed password
- `role` - ADMIN or MEMBER

### Project
- `id` - Unique identifier
- `name` - Project name
- `description` - Project description
- `ownerId` - Reference to User

### Task
- `id` - Unique identifier
- `title` - Task title
- `description` - Task description
- `status` - TODO, IN_PROGRESS, DONE
- `projectId` - Reference to Project
- `assigneeId` - Reference to User
- `dueDate` - Optional due date

### ProjectMember
- Links users to projects with roles

## Scripts

| Command         | Description                   |
|----------------|------------------------------|
| npm run dev     | Start development server      |
| npm run build  | Build for production      |
| npm run start  | Start production server  |
| npm run db:generate | Generate Prisma client |
| npm run db:push    | Push schema to database |
| npm run db:seed    | Seed database        |

## Frontend Scripts

| Command         | Description                   |
|----------------|------------------------------|
| npm run dev     | Start development server      |
| npm run build   | Build for production       |
| npm run lint   | Run ESLint              |

## Design

The frontend features:
- Clean, modern UI with Tailwind CSS
- Responsive layout
- Icon-driven interface using Lucide React
- Interactive charts with Recharts
- Gradient login page
- Color-coded status badges
- Card-based layouts

## License

MIT License

## Support

For issues or questions, please create a GitHub issue.