# Emotion Check-in System

<a href="https://emotioncheckinsystem.com" target="_blank" rel="noopener noreferrer">
  <img src="./frontend/src/assets/previews/login.png" alt="Preview" />
</a>

## 📋 Table of Contents
- [👋 Introduction](#-introduction)
- [✨ Features](#-features)
- [🎯 Live Demo](#-live-demo)
- [🚀 Get Started](#-get-started)
- [🐳 Running with Docker](#-running-with-docker)
- [📚 Documentation](#-documentation)
- [🎓 Project Background](#-project-background)
- [⚖️ License](#️-license)

---

## 👋 Introduction

The **Emotion Check-in System** is a comprehensive, **fully Dockerized** platform that helps organizations support employee well-being while tracking attendance. Employees use a mobile app to check in daily and share how they feel through simple emoji choices and optional notes. HR and Super Admins can then use a powerful web dashboard to view overall trends in employee emotions and attendance, displayed in easy-to-understand charts and AI-powered insights.

By combining daily attendance with emotional insights, the system enables organizations to notice patterns, provide timely support when negative moods persist, and create a healthier, more productive work environment.

The system includes:
- **React + Vite frontend** for intuitive dashboards, analytics, and management
- **TypeScript/Express backend** with Prisma, Redis, and BullMQ for emotion processing, AI analysis, and background jobs
- **AI-powered insights** using Groq API for sentiment analysis and recommendations
- **Rich communication** with MDX Editor for announcements and action plans
- **🐳 Docker & Docker Compose** for consistent development and deployment environments

For detailed documentation, see:
- [Frontend README](./frontend/README.md)
- [Backend README](./backend/README.md)

---

## ✨ Features

👉 **Daily Emotion Check-ins**: Intuitive emoji-based interface for employees to log their emotional state and attendance.

👉 **AI-Powered Analysis**: Automated sentiment scoring, critical mood trend detection, and intelligent recommendations.

👉 **Real-Time Analytics Dashboard**: Interactive charts showing mood trends, attendance patterns, and department comparisons.

👉 **Critical Employee Monitoring**: Automatic watchlist and email alerts for employees showing concerning emotional patterns.

👉 **Action Plan Management**: Create, track, and manage intervention plans with rich text editor and file attachments.

👉 **Advanced Search & Filtering**: Powerful search across check-ins, employees, and action plans with infinite scrolling.

👉 **Rich Communication Tools**: Announcements with MDX Editor support for formatted content and attachments.

👉 **Role-Based Access Control**: Secure authentication with Employee, Admin, and Super Admin roles.

👉 **Background Workers**: BullMQ + Redis for fast email delivery, cache management, and async processing.

👉 **System Management**: Configure emotion categories, define scoring metrics, and manage organizational settings.

👉 **Bulk Operations**: CSV import for mass employee registration and efficient onboarding.

👉 **Responsive Design**: Seamless experience across desktop, tablet, and mobile devices with dark mode support.

👉 **🐳 Docker Ready**: Fully containerized with Docker Compose for instant setup across any environment.

---

## 🎯 Live Demo

Experience the Emotion Check-in System in action:

- **Frontend Dashboard**: [https://emotioncheckinsystem.com](https://emotioncheckinsystem.com)
- **Backend API**: [https://api.emotioncheckinsystem.com](https://api.emotioncheckinsystem.com)

> **Demo Credentials**:
> - Super Admin: `super-admin@ata.it.th` / `Super1234$`
> - Admin: `admin@ata.it.th`/ `Admin1234$`

---

## 🚀 Get Started

### Prerequisites
- Node.js (v18 or higher) *or* Docker & Docker Compose
- PostgreSQL database
- Redis instance
- Cloudinary account (for file uploads)
- Resend account (for emails)
- Groq API key (for AI features)

### Quick Start (Without Docker)

1. **Clone the repository**
```bash
   git clone https://github.com/fisheeesh/emotion-checkin-system.git
   cd emotion-checkin-system
```

2. **Set up Frontend**
```bash
   cd frontend
   npm install
   npm run dev
```
   Frontend will be available at **http://localhost:5173**

3. **Set up Backend**
```bash
   cd backend
   npm install
   
   # Initialize database
   npx prisma generate
   npx prisma migrate dev --name init
   
   # Start API and workers
   npm run dev
```
   Backend API will be available at **http://localhost:8080**

---
## 🐳 Running with Docker

**The easiest way to get started!** Docker eliminates "it works on my machine" problems and ensures consistent environments across all developers.

### Prerequisites
- Docker Desktop (includes Docker Compose)
- `.env` file configured in the backend folder

### Quick Start with Docker

1. **Clone the repository**
```bash
   git clone https://github.com/fisheeesh/emotion-checkin-system.git
   cd emotion-checkin-system
```

2. **Configure environment variables**
```bash
   # Copy the example env file and fill in your credentials
   cp .env.example backend/.env
```
   
   > 💡 **Tip**: The `.env.example` file in the root directory contains all required variables for both frontend and backend. Use it as a reference when setting up your `backend/.env` file.

   > ⚠️ **Database Notice**: This Docker setup does **not** include a database service. The current configuration uses a cloud-hosted PostgreSQL database (Neon). If you want to run the database locally, you'll need to:
   > - Add a PostgreSQL service to `docker-compose.yml`
   > - Update the `DATABASE_URL` in your `.env` file to point to the containerized database
   > - Example: `DATABASE_URL="postgresql://user:password@postgres:5432/your_db"`

3. **Start all services**
```bash
   docker compose up --build
```
   
   That's it! 🎉
   - Frontend: **http://localhost:5173**
   - Backend API: **http://localhost:8080**
   - Redis: **localhost:6379**

### Development with Hot Reload

For active development with automatic file watching:
```bash
docker compose watch
```

This will:
- ✅ Automatically rebuild when package files change
- ✅ Sync code changes instantly without rebuilds
- ✅ Restart services when needed

### Useful Docker Commands
```bash
# Start in background (detached mode)
docker compose up -d

# View logs
docker compose logs -f

# View logs for specific service
docker compose logs -f api

# Stop all services
docker compose down

# Stop and remove volumes (fresh start)
docker compose down -v

# Restart a service
docker compose restart api

# Execute commands in container
docker compose exec api npx prisma migrate dev
docker compose exec api npm install <package-name>
```

### Docker Architecture

The system runs three containerized services:
```
┌─────────────────────────────────────────┐
│  Frontend (React + Vite)                │
│  Port: 5173                             │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│  Backend (Express + Prisma)             │
│  Port: 8080                             │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│  Redis (Cache + Queue)                  │
│  Port: 6379                             │
└─────────────────────────────────────────┘
                  │
                  │ (External Connection)
                  ▼
         ☁️ PostgreSQL (Neon)
```

### Optional: Adding Local Database

If you want to run PostgreSQL locally instead of using a cloud database, add this to your `docker-compose.yml`:
```yaml
services:
  # ... existing services ...

  postgres:
    image: postgres:16-alpine
    ports:
      - 5432:5432
    environment:
      POSTGRES_USER: your_user
      POSTGRES_PASSWORD: your_password
      POSTGRES_DB: your_db
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  redis_data:
  postgres_data:  # Add this
```

Then update your `backend/.env`:
```env
DATABASE_URL="postgresql://your_user:your_password@postgres:5432/your_db"
```

### Why Docker?

- ✅ **No installation headaches** - No need to install Node.js, Redis, or worry about versions
- ✅ **Consistent environments** - Same setup for all developers and production
- ✅ **Instant onboarding** - New team members run one command to get started
- ✅ **Isolated dependencies** - No conflicts with other projects on your machine
- ✅ **Easy cleanup** - Remove everything with `docker compose down -v`

---

## 📚 Documentation

- **[Frontend Documentation](./frontend/README.md)** - React app setup, components, and architecture
- **[Backend Documentation](./backend/README.md)** - API endpoints, database schema, and services
- **[Postman Collection](https://www.postman.com/fantastic-4-5546/workspace/fisheeesh-s-workspace/collection/36272211-9ba87529-ebfa-4f97-90db-8dfba23b8f3d?action=share&creator=36272211&active-environment=36272211-22e58004-e1c9-4d35-9a76-deee059de117)** - Complete API collection for testing

> **Note**: The Postman collection includes 2 types of URLs in variables:
> - `base_url` - For local development (http://localhost:8080)
> - `prod_url` - For production environment (https://api.emotioncheckinsystem.com)

---

## 🎓 Project Background

This application was developed as a **senior project** at **Mae Fah Luang University** by the **Software Engineering** department, originally inspired by and in collaboration with **ATA IT (Thailand)**.

### Academic Context
- **Institution**: Mae Fah Luang University
- **Department**: Software Engineering
- **Project Type**: Senior Project
- **Year**: 2024-2025

### Important Notes

> ⚠️ **Data Privacy & Responsibility**  
> All privacy inquiries and data subject requests should be directed to **6531503187@lamduan.mfu.ac.th**.  
> **ATA IT is not responsible** for the operation, data handling, or privacy practices of this application.

> 📧 **Contact Information**  
> For questions, support, or feedback about this project:
> - **Email**: 6531503187@lamduan.mfu.ac.th
> - **Website**: https://emotioncheckinsystem.com

### Acknowledgments

We would like to thank:
- **ATA IT (Thailand)** for the initial project inspiration and collaboration opportunity
- **Mae Fah Luang University** for academic guidance and support
- All contributors and testers who helped shape this system

---

## ⚖️ License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">

**Built with ❤️ by Software Engineering students at Mae Fah Luang University**

*Creating healthier, more empathetic workplaces where every voice matters and every emotion counts.*

</div>