# MrNewton Activity Provider

Backend service for MrNewton Activity Provider in the Inven!RA architecture. Provides REST API endpoints for activity configuration, deployment, and student submissions.

## Tech Stack

- **Node.js** with **TypeScript**
- **Express** - REST API framework
- **MongoDB Atlas** - Cloud database
- **Swagger UI** - API documentation

## Setup

### Prerequisites
- Node.js 20.x+
- npm 10.x+

### Installation

```bash
npm install
```

### Configuration

The application connects to MongoDB Atlas. Set environment variables if using a different cluster:
```bash
MONGODB_URL=mongodb+srv://user:password@cluster.mongodb.net/
MONGODB_DB_NAME=mrnewton-activity
PORT=5000
```

Default connection uses the pre-configured MongoDB Atlas cluster.

### Run

**Development mode (with hot-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm run build
npm start
```

Server runs on: **http://localhost:5000**

## API Documentation

Interactive API docs: **http://localhost:5000/api-docs**

## Main Endpoints

### Configuration
- `GET /api/v1/config/params` - Get configuration parameter schema
- `POST /api/v1/config` - Create and validate activity configuration

### Deployment
- `POST /api/v1/deploy` - Deploy activity instance

### Submissions
- `GET /api/v1/submissions/instance/{instanceId}` - Get all submissions for an instance
- `GET /api/v1/submissions/instance/{instanceId}/student/{studentId}` - Get student submission

### Health
- `GET /health` - Service health check

## Database Structure

**Database:** `mrnewton-activity` (MongoDB Atlas)

**Collections:**
1. **`configParamsSchemas`** - Activity parameter definitions
2. **`activities`** - Activity configurations (quizzes)
3. **`instances`** - Deployed activity instances
4. **`submissions`** - Student submissions with attempts

## Architecture

- **Domain Layer:** Models, validators, builders
- **Repository Layer:** Data access (MongoDB)
- **Service Layer:** Business logic
- **API Layer:** REST controllers and routes
- **Infrastructure:** Database, logging

## Sample Data

Sample data is available in the `sample-data/` directory. The database on MongoDB Atlas is pre-populated with test data including activities, instances, and submissions.

