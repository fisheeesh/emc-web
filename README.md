# Emotion Check-in System

<a href="https://emotioncheckinsystem.com" target="_blank" rel="noopener noreferrer">
  <img src="./frontend/src/assets/previews/login.png" alt="Preview" />
</a>

## 📋 Table of Contents
- [👋 Introduction](#-introduction)
- [✨ Features](#-features)
- [🎯 Live Demo](#-live-demo)
- [🚀 Get Started](#-get-started)
- [📚 Documentation](#-documentation)
- [⚖️ License](#️-license)

---

## 👋 Introduction

The **Emotion Check-in System** is a comprehensive platform that helps organizations support employee well-being while tracking attendance. Employees use a mobile app to check in daily and share how they feel through simple emoji choices and optional notes. HR and Super Admins can then use a powerful web dashboard to view overall trends in employee emotions and attendance, displayed in easy-to-understand charts and AI-powered insights.

By combining daily attendance with emotional insights, the system enables organizations to notice patterns, provide timely support when negative moods persist, and create a healthier, more productive work environment.

The system includes:
- **React + Vite frontend** for intuitive dashboards, analytics, and management
- **TypeScript/Express backend** with Prisma, Redis, and BullMQ for emotion processing, AI analysis, and background jobs
- **AI-powered insights** using Groq API for sentiment analysis and recommendations
- **Rich communication** with MDX Editor for announcements and action plans

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

---

## 🎯 Live Demo

Experience the Emotion Check-in System in action:

- **Frontend Dashboard**: [https://emotioncheckinsystem.com](https://emotioncheckinsystem.com)
- **Backend API**: [https://api.emotioncheckinsystem.com](https://api.emotioncheckinsystem.com)

> **Demo Credentials**:
> - Super Admin: `admin@ata.it.th` / `Admin1234$`

---

## 🚀 Get Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- Redis instance
- Cloudinary account (for file uploads)
- Resend account (for emails)
- Groq API key (for AI features)

### Quick Start

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

## 📚 Documentation

- **[Frontend Documentation](./frontend/README.md)** - React app setup, components, and architecture
- **[Backend Documentation](./backend/README.md)** - API endpoints, database schema, and services
- **[Postman Collection](https://www.postman.com/fantastic-4-5546/workspace/fisheeesh-s-workspace/collection/36272211-9ba87529-ebfa-4f97-90db-8dfba23b8f3d?action=share&creator=36272211&active-environment=36272211-22e58004-e1c9-4d35-9a76-deee059de117)** - Complete API collection for testing

> **Note**: The Postman collection includes 2 types of URLs in variables:
> - `base_url` - For local development (http://localhost:8080)
> - `prod_url` - For production environment (https://api.emotioncheckinsystem.com)

---

## ⚖️ License

This project is licensed under the [MIT License](LICENSE).

---

**Built with ❤️ for creating healthier, more empathetic workplaces where every voice matters and every emotion counts.**