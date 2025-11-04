# Emotion Check-in System Backend (API & Workers)

A TypeScript/Express backend for the **Emotion Check-in System** - a comprehensive platform that combines employee attendance tracking with emotional well-being monitoring. The system enables organizations to support employee mental health through daily check-ins, AI-powered sentiment analysis, and actionable insights for HR and management teams.

## 📑 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [Run Locally](#run-locally)
- [API Base Paths](#api-base-paths)
- [Routes](#routes)
- [Security](#security)
- [Deployment](#deployment)
- [Error Response Shape](#error-response-shape)

---

## Overview

The Emotion Check-in System is a platform that helps organizations support employee well-being while also keeping track of attendance. Employees use a mobile app to check in each day and share how they feel through simple emoji choices and short notes. After submitting, they receive confirmation that both their attendance and emotion have been recorded.

HR and Super Admin can then use a web dashboard to view overall trends in employee emotions and attendance, displayed in easy-to-understand charts and reports. By combining daily attendance with emotional insights, the system enables organizations to notice patterns, provide timely support when negative moods persist, and create a healthier, more productive work environment.

---

## Features

### Authentication & Authorization
- **JWT Authentication**: Secure token-based auth with HttpOnly cookies (different configurations for production and development environments)
- **Role-Based Access Control (RBAC)**: Employee, Admin, and Super Admin roles with granular permissions
  - **Admin Role**: Access to Sentiments and Attendance dashboards only, restricted to their assigned department data
  - **Super Admin Role**: Full access to all 4 dashboards (Sentiments, Attendance, Analytics & Insights, and General Management) with company-wide visibility
  - **Department-Level Access Control**: Admins can only view and manage data for their specific department (e.g., IT Admin sees only IT department data), while Super Admins have cross-departmental access with advanced filtering options
- **OTP Verification**: Email-based OTP for registration and password reset flows
- **CSV Bulk Import**: Mass registration feature for onboarding multiple employees efficiently

### Emotion & Attendance Tracking
- **Daily Check-ins**: Employees submit emotional state with emoji selections and optional notes
- **Attendance Recording**: Automatic attendance logging with check-in timestamps
- **Check-in History**: Comprehensive history tracking with infinite scrolling and search capabilities
- **Profile Management**: Employees can view and update their personal information and avatar

### AI-Powered Analysis
- **Emotion Score Calculation**: AI-driven sentiment analysis for accurate emotion scoring
- **Critical Mood Trend Detection**: Automated identification of concerning emotional patterns
- **Recommendations Engine**: AI-generated suggestions for top employee concerns
- **Word Cloud Analytics**: Visual representation of common themes from employee notes

### Data Visualization & Insights
- **Analytics Dashboard**: Real-time charts and graphs for mood and attendance trends
- **Department Comparisons**: Cross-departmental sentiment analysis with intelligent filtering
- **Advanced Department Filtering**: 
  - Super Admins can filter and compare data across all departments in the organization
  - Department Admins automatically see filtered data for their assigned department only
  - Multi-select department filters for comprehensive cross-department analysis
  - Department-specific metrics and KPIs for targeted insights
- **Leaderboard System**: Positive engagement tracking and recognition
- **Attendance Overview**: Daily, weekly, and monthly attendance metrics

### Communication & Action
- **Action Plan Management**: Create, track, and manage intervention plans for at-risk employees
- **Announcement System**: Rich text announcements with file attachments (images, PDFs, documents)
- **Notification Center**: Real-time notifications with read/unread status tracking
- **Email Notifications**: Automated alerts for critical moods and important events
- **Due Date Reminders**: Cron job-based notifications for overdue and upcoming action plan deadlines

### Background Processing
- **BullMQ Workers**: Fast, reliable background job processing with Redis
- **Email Queue**: Asynchronous email sending with rich HTML templates and attachments
- **Cache Invalidation**: Automated cache management for optimal performance

### Critical Employee Monitoring
- **Watchlist Management**: Track employees showing concerning emotional patterns
- **Critical Alerts**: Immediate email notifications when critical moods are detected
- **Historical Tracking**: Complete audit trail of emotional well-being over time

### Rich Content Support
- **File Uploads**: Cloudinary integration for secure image and document storage via Multer
- **Rich Text Editor**: Full-featured text editing with bold, italic, tables, highlights, and more
- **Attachment Support**: Email announcements with multiple file attachments

### Security & Observability
- **Helmet Security**: Comprehensive HTTP header protection
- **CORS Whitelist**: Strict origin control with credential support
- **Rate Limiting**: API endpoint throttling to prevent abuse
- **Input Sanitization**: HTML and SQL injection prevention
- **Request Logging**: Morgan-based HTTP request tracking
- **Error Handling**: Centralized error management with consistent response shapes

### Data Management
- **Infinite Scrolling**: Efficient pagination for large datasets
- **Advanced Search**: Powerful filtering and search capabilities across all entities
- **PostgreSQL + Prisma**: Type-safe database access with automatic migrations
- **Redis Caching**: High-performance data caching for frequently accessed resources

---

## Tech Stack

- **Runtime**: Node.js + TypeScript
- **Web Framework**: Express 5
- **Validation**: express-validator
- **Database**: PostgreSQL + Prisma ORM
- **Queue/Cache**: BullMQ + Redis (ioredis)
- **Authentication**: JWT (access/refresh tokens) in HttpOnly, Secure cookies
- **Email Service**: Resend (with rich HTML templates and attachments)
- **File Storage**: Cloudinary (via Multer)
- **AI/ML**: Groq API for sentiment analysis and recommendations
- **Security**: helmet, CORS, express-rate-limit, sanitize-html
- **Utilities**: compression, morgan, cron, date-fns, marked, moment

---

## Folder Structure
```
backend/
├─ prisma/                                      # Database schema and migrations
│  ├─ schema.prisma                             # Prisma schema defining models, relations, and database config
│  └─ migrations/                               # Auto-generated migration files for database version control
│
├─ src/
│  ├─ config/                                   # Core configuration files
│  │  ├─ cloudinary.config.ts                   # Cloudinary SDK setup for file upload/storage
│  │  ├─ cookies.config.ts                      # Cookie configuration for development and production environments
│  │  ├─ error-codes.ts                         # Centralized error code constants for consistent error handling
│  │  ├─ prisma-client.ts                       # Singleton Prisma Client instance for database operations
│  │  └─ redis-client.ts                        # Redis client configuration for caching and queues
│  │
│  ├─ controllers/                              # Request handlers for routes
│  │  ├─ admin/
│  │  │  ├─ admin-controller.ts                 # Admin dashboard stats, notifications CRUD, announcements with attachments
│  │  │  ├─ ai-controller.ts                    # Trigger AI analysis, regenerate insights, generate recommendations
│  │  │  ├─ attendance-controller.ts            # Daily attendance data, check-in hours, attendance overview charts
│  │  │  └─ sentiments-controller.ts            # Mood overview, sentiment comparisons, watchlist/critical emp management, action plans
│  │  ├─ auth/
│  │  │  └─ auth-controller.ts                  # Register with OTP, login/logout, forgot password flow, auth status check
│  │  ├─ super-admin/
│  │  │  ├─ action-plan-management-controller.ts # Full CRUD for action plans with search and infinite scroll
│  │  │  ├─ analytics-controller.ts             # System-wide analytics, top concerns word cloud data
│  │  │  ├─ dep-controller.ts                   # Department CRUD operations
│  │  │  └─ user-management-controller.ts       # User CRUD, bulk CSV import for mass registration
│  │  └─ user/
│  │     └─ user-controller.ts                  # Employee daily emotion check-in, personal check-in history, profile management
│  │
│  ├─ jobs/                                     # Background job processing with BullMQ
│  │  ├─ queues/
│  │  │  ├─ cache-queue.ts                      # Cache queue definition for cache invalidation and management
│  │  │  └─ email-queue.ts                      # Email queue definition for async email sending
│  │  └─ workers/
│  │     ├─ cache-worker.ts                     # Cache worker for invalidating and updating Redis cache entries
│  │     └─ email-worker.ts                     # Email worker processing rich HTML emails with attachments via Resend
│  │
│  ├─ middlewares/                              # Express middleware functions
│  │  ├─ auth-middleware.ts                     # JWT token verification from HttpOnly cookies
│  │  ├─ authorize-middleware.ts                # Role-based access control (EMPLOYEE, ADMIN, SUPERADMIN)
│  │  ├─ rate-limiter.ts                        # API rate limiting to prevent abuse
│  │  └─ upload-files-middleware.ts             # Multer configuration for file uploads to Cloudinary
│  │
│  ├─ routes/                                   # API route definitions
│  │  └─ v1/
│  │     ├─ index.ts                            # Main router mounting all v1 routes (/api/v1)
│  │     ├─ admin/
│  │     │  └─ admin-routes.ts                  # Admin routes for dashboard, analytics, notifications, action plans
│  │     ├─ auth/
│  │     │  └─ auth-routes.ts                   # Public auth routes for registration, login, password reset
│  │     ├─ super-admin/
│  │     │  └─ super-admin-routes.ts            # Super admin routes for user/department management, system analytics
│  │     └─ user/
│  │        └─ user-routes.ts                   # Employee routes for check-in, history, and profile management
│  │
│  ├─ services/                                 # Business logic layer
│  │  ├─ action-plan-services.ts                # Action plan business logic: create, update, delete, track completion
│  │  ├─ admin-services.ts                      # Admin-specific services: notifications, announcements, dashboard data
│  │  ├─ ai-services.ts                         # Groq API integration for sentiment analysis and AI recommendations
│  │  ├─ auth-services.ts                       # Authentication services: JWT generation, OTP validation, password hashing
│  │  ├─ critical-services.ts                   # Critical employee monitoring: watchlist, alerts, email notifications
│  │  ├─ emotion-check-in-services.ts           # Check-in processing: emotion scoring, attendance recording
│  │  ├─ emp-services.ts                        # Employee services: profile management, history retrieval
│  │  └─ system-service.ts                      # System-level services: cron jobs, cache management, background tasks
│  │
│  ├─ utils/                                    # Utility functions and helpers
│  │  ├─ ai-promts.ts                           # AI prompt templates for sentiment analysis and recommendations
│  │  ├─ authorize.ts                           # Authorization helper functions for role checking
│  │  ├─ cache.ts                               # Redis caching utilities with TTL management
│  │  ├─ check.ts                               # Validation and checking utilities
│  │  ├─ email-templates.ts                     # Rich HTML email templates (OTP, notifications, announcements)
│  │  ├─ generate.ts                            # Token generation (JWT, OTP, random strings)
│  │  └─ helpers.ts                             # Common helper functions (date formatting, data transformation)
│  │
│  ├─ app.ts                                    # Express app setup: middleware, CORS, security, error handling
│  └─ index.ts                                  # Server bootstrap: database connection, Redis, server startup
│
└─ package.json                                 # Dependencies, scripts, project metadata
```

---

## Environment Variables

Create a `.env` file in the root directory (production values should be set in your hosting environment):
```env
NODE_ENV="development"
PORT="8080"
APP_DEBUG="true"

# JWT Secrets (generate your own secure keys)
ACCESS_TOKEN_SECRET="your-access-token-secret-here"
REFRESH_TOKEN_SECRET="your-refresh-token-secret-here"

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"

# Redis Configuration
REDIS_URL="your-redis-connection-url"
REDIS_HOST="your-redis-host"
REDIS_PORT="your-redis-port"
REDIS_PASSWORD="your-redis-password"

# AI Configuration
GROQ_API_KEY="your-groq-api-key"

# Database
DATABASE_URL="your-postgresql-connection-string"

# Email Configuration (Resend)
RESEND_API_KEY="your-resend-api-key"
SENDER_EMAIL="no-reply@yourdomain.com"
RECIEVER_EMAIL="your-admin-email@yourdomain.com"

# Frontend URL (for CORS and email links)
DASHBOARD_URL="your-deployed-frontend-url"
```

### CORS Configuration

The application uses a strict whitelist for CORS. Update the whitelist in your code to include your deployed frontend URLs:
```javascript
var whitelist = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:4000',
    'http://127.0.0.1:4000',
    'https://your-deployed-frontend-url.vercel.app',
    'https://yourdomain.com'
]
```

### Cookie Configuration

The system uses different cookie configurations for development and production:
- **Development**: Cookies work on HTTP for local testing
- **Production**: Enforces Secure flag for HTTPS-only transmission

---

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Run API + email worker concurrently (nodemon) |
| `npm run dev:node` | Run API only (nodemon `src/index.ts`) |
| `npm run cache` | Run cache worker only (nodemon) |
| `npm run email` | Run email worker only (nodemon) |
| `npm run build` | TypeScript build to `dist/` |
| `npm start` | Start compiled server (`dist/index.js`) |
| `npm run deploy` | Apply Prisma migrations and generate client |

---

## Run Locally

1. **Install dependencies**
```bash
npm install
```

2. **Generate Prisma client**
```bash
npx prisma generate
```

3. **Initialize and migrate database**
```bash
npx prisma migrate dev --name init
```

4. **Start development server (API + workers)**
```bash
npm run dev
```

Or run API only:
```bash
npm run dev:node
```

---

## API Base Paths

- **Public/Auth**: `/api/v1/*`
- **Admin** (requires Admin or Super Admin role): `/api/v1/admin/*`
- **Super Admin** (requires Super Admin role only): `/api/v1/super-admin/*`
- **User** (authenticated employees): `/api/v1/user/*`

---

## Routes

### Auth Routes (`/api/v1`)

| Route | Method | Description | Auth Required |
|---|---|---|---|
| `/register` | POST | Register a new user (starts OTP flow) | No |
| `/verify-otp` | POST | Verify OTP for registration | No |
| `/confirm-password` | POST | Set password after OTP verification | No |
| `/login` | POST | Login user (sets HttpOnly JWT cookies) | No |
| `/logout` | POST | Logout user (clears cookies) | No |
| `/forgot-password` | POST | Initiate password reset (send OTP) | No |
| `/verity-otp-forgot` | POST | Verify OTP for password reset | No |
| `/reset-password` | POST | Reset password after OTP verification | No |
| `/auth-check` | GET | Check authentication status | Yes (Employee/Admin/Super-Admin) |

### Admin Routes (`/api/v1/admin`)

**Access Control**: Admin and Super Admin roles. Admins can only access Sentiments and Attendance routes and see data for their assigned department. Super Admins have full access to all routes with company-wide visibility and department filtering capabilities.

| Route | Method | Description | Auth Required |
|---|---|---|---|
| `/test` | GET | Test endpoint for admin access | Yes (Admin/Super Admin) |
| `/mood-overview` | GET | Get overall mood statistics and trends (department-filtered for Admins) | Yes (Admin/Super Admin) |
| `/sentiments-comparison` | GET | Compare sentiments across time periods (department-scoped for Admins) | Yes (Admin/Super Admin) |
| `/all-departments` | GET | List all departments (Super Admin sees all, Admin sees assigned only) | Yes (Admin/Super Admin) |
| `/admin-user` | GET | Get admin user profile data | Yes (Admin/Super Admin) |
| `/leaderboards` | GET | Get employee engagement leaderboards (department-filtered for Admins) | Yes (Admin/Super Admin) |
| `/notifications` | GET | Get all notifications (searchable, infinite scroll, department-scoped) | Yes (Admin/Super Admin) |
| `/notifications` | PATCH | Mark notification as read | Yes (Admin/Super Admin) |
| `/notifications` | DELETE | Delete notification | Yes (Admin/Super Admin) |
| `/critical-emps` | GET | Get list of critical employees (department-filtered for Admins) | Yes (Admin/Super Admin) |
| `/critical-emps` | DELETE | Remove employee from critical list (department-restricted for Admins) | Yes (Admin/Super Admin) |
| `/watchlist-emps` | GET | Get watchlist employees (department-filtered for Admins) | Yes (Admin/Super Admin) |
| `/watchlist-emps` | DELETE | Remove employee from watchlist (department-restricted for Admins) | Yes (Admin/Super Admin) |
| `/daily-attendance` | GET | Get daily attendance data (department-filtered for Admins) | Yes (Admin/Super Admin) |
| `/check-in-hours` | GET | Get check-in time distribution (department-filtered for Admins) | Yes (Admin/Super Admin) |
| `/attendance-overview` | GET | Get comprehensive attendance overview (department-filtered for Admins) | Yes (Admin/Super Admin) |
| `/ai-analysis` | POST | Generate AI-powered sentiment analysis (department-scoped for Admins) | Yes (Admin/Super Admin) |
| `/regenerate-ai-analysis` | POST | Regenerate AI analysis for specific period (department-scoped) | Yes (Admin/Super Admin) |
| `/generate-recommendation` | POST | Generate AI recommendations for concerns (department-scoped) | Yes (Admin/Super Admin) |
| `/action-plans` | POST | Create new action plan (department-restricted for Admins) | Yes (Admin/Super Admin) |
| `/action-plans` | PATCH | Mark action plan as completed (department-restricted for Admins) | Yes (Admin/Super Admin) |
| `/make-announcement` | POST | Create announcement with attachments (department-scoped) | Yes (Admin/Super Admin) |

### Super Admin Routes (`/api/v1/super-admin`)

**Access Control**: Super Admin role only. These routes provide full system access including System Analytics and Management dashboards (in addition to Sentiments and Attendance that Admins can access). Super Admins can view and manage data across all departments with advanced filtering capabilities.

| Route | Method | Description | Auth Required |
|---|---|---|---|
| `/test` | GET | Test endpoint for super admin access | Yes (Super Admin) |
| `/users` | GET | Get all users (searchable, infinite scroll, cross-department) | Yes (Super Admin) |
| `/users` | POST | Create new user | Yes (Super Admin) |
| `/users` | PATCH | Update user information | Yes (Super Admin) |
| `/users` | DELETE | Delete user | Yes (Super Admin) |
| `/bulk-register` | POST | Bulk register users via CSV import | Yes (Super Admin) |
| `/departments` | GET | Get all departments (company-wide access) | Yes (Super Admin) |
| `/departments` | POST | Create new department | Yes (Super Admin) |
| `/departments` | PATCH | Update department | Yes (Super Admin) |
| `/departments` | DELETE | Delete department | Yes (Super Admin) |
| `/action-plans` | GET | Get all action plans (searchable, infinite scroll, all departments) | Yes (Super Admin) |
| `/action-plans` | PATCH | Update action plan | Yes (Super Admin) |
| `/action-plans` | DELETE | Delete action plan | Yes (Super Admin) |
| `/analytics-overview` | GET | Get comprehensive system analytics (all departments) | Yes (Super Admin) |
| `/top-concerns` | GET | Get top employee concerns (word cloud data, all departments) | Yes (Super Admin) |

### User Routes (`/api/v1/user`)

| Route | Method | Description | Auth Required |
|---|---|---|---|
| `/test` | GET | Test endpoint for user access | Yes (Employee/Admin/SuperAdmin) |
| `/check-in` | POST | Submit daily emotion check-in and attendance | Yes (Employee/Admin/SuperAdmin) |
| `/my-history` | GET | Get personal check-in history (searchable, infinite scroll) | Yes (Employee/Admin/SuperAdmin) |
| `/emotion-categories` | GET | Get all available emotion categories with emojis | Yes (Employee/Admin/SuperAdmin) |
| `/emp-data` | GET | Get current employee profile data (name, email, avatar, etc.) | Yes (Employee/Admin/SuperAdmin) |
| `/emp-data` | PATCH | Update employee profile information (supports avatar upload) | Yes (Employee/Admin/SuperAdmin) |

> **Note**: The `/emp-data` PATCH endpoint supports multipart/form-data for avatar uploads. Use the field name `avatar` when uploading profile pictures.

> All protected endpoints enforce **auth** middleware.  
> Admin endpoints enforce **authorize(true, "ADMIN", "SUPERADMIN")**.  
> Super Admin endpoints enforce **authorize(true, "SUPERADMIN")**.

---

## Security

- **Authentication**: JWT tokens stored in **HttpOnly, Secure** cookies with separate configurations for development (HTTP) and production (HTTPS)
- **CORS**: Strict whitelist with `credentials: true` for cookie support
- **HTTP Headers**: Enhanced security via `helmet()` middleware
- **Rate Limiting**: API endpoint throttling using `express-rate-limit`
- **Input Validation**: Comprehensive validation with `express-validator`
- **HTML Sanitization**: Protection against XSS attacks using `sanitize-html`
- **Request Logging**: HTTP request tracking with `morgan`
- **Error Handling**: Centralized error management with consistent response formats
- **Compression**: Response compression for optimized bandwidth usage

---

## Deployment

### Prerequisites
- PostgreSQL database (recommended: Neon, Supabase, or Railway)
- Redis instance (recommended: Redis Cloud or Upstash)
- Cloudinary account for file storage
- Resend account for email delivery
- Groq API key for AI features

### Build and Deploy

1. **Build the application**
```bash
npm run build
```

2. **Apply database migrations**
```bash
npm run deploy
```

3. **Start production server**
```bash
npm start
```

### Recommended Hosting Platforms
- **API Server**: Render, Railway, or Fly.io
- **Database**: Neon (PostgreSQL)
- **Redis**: Redis Cloud or Upstash
- **File Storage**: Cloudinary
- **Email**: Resend

### Environment Setup
Ensure all environment variables from `.env` are configured in your hosting platform's environment settings.

---

## Error Response Shape

All API errors follow a consistent response format:
```json
{
  "message": "Human-readable error description",
  "error": "ERROR_CODE_CONSTANT"
}
```

Example:
```json
{
  "message": "Invalid credentials provided",
  "error": "INVALID_CREDENTIALS"
}
```

---

## Features in Detail

### AI-Powered Insights
The system leverages Groq's AI API to provide intelligent analysis of employee emotions:
- **Emotion Scoring**: Converts emoji selections and text notes into quantifiable sentiment scores
- **Trend Detection**: Identifies patterns indicating declining mental health or increasing stress
- **Recommendations**: Generates actionable suggestions based on common employee concerns
- **Word Cloud Analysis**: Extracts and visualizes frequent themes from employee notes

### Critical Employee Monitoring
When employees consistently report negative emotions, the system:
1. Automatically adds them to a watchlist for HR monitoring
2. Sends immediate email notifications to designated administrators
3. Triggers AI analysis to identify root causes
4. Suggests intervention strategies through action plans

### Action Plan Management
HR and Super Admins can:
- Create structured intervention plans for at-risk employees
- Set deadlines and assign responsibilities
- Track completion status
- Receive automated reminders for overdue or upcoming deadlines (via cron jobs)

### Rich Communication
- **Announcements**: Support for bold, italic, tables, highlights, and more via rich text editor
- **Attachments**: Upload and share images, PDFs, and documents with announcements
- **Email Templates**: Beautiful, responsive HTML email templates for all notifications

### Bulk Operations
- **CSV Import**: Upload CSV files to register multiple employees at once
- **Validation**: Automatic validation and error reporting for bulk imports
- **Progress Tracking**: Real-time feedback during bulk operations

### Employee Profile Management
Employees can:
- View their complete profile information
- Update personal details (name, contact information)
- Upload and change profile avatars
- Manage their account settings

---

<div align="center">

**Built with ❤️ by Software Engineering students at Mae Fah Luang University**

*Creating healthier, more empathetic workplaces where every voice matters and every emotion counts.*

</div>