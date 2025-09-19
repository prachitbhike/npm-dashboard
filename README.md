# NPM Package Growth Dashboard

A comprehensive dashboard for tracking and analyzing the growth of npm packages over time. Monitor download trends, identify high-growth packages, and spot emerging patterns in the npm ecosystem.

## 🚀 Features

- **Real-time Package Tracking**: Add any npm package and track its download statistics
- **Growth Analysis**: Identify packages with exponential growth potential
- **Interactive Charts**: Visualize download trends with beautiful, responsive charts
- **Growth Metrics**: Calculate growth scores, acceleration, and trend directions
- **Search Integration**: Search and add packages directly from the npm registry
- **Historical Data**: Collect and analyze historical download data
- **Trending Packages**: Discover packages showing high growth patterns
- **Weekly Updates**: Automated data collection to keep metrics current

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Hono + TypeScript
- **Database**: PostgreSQL with time-series optimization
- **Charts**: Recharts for interactive visualizations
- **Data Sources**: npm Registry API + npm Downloads API

### System Components
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React Frontend │────│   Hono Backend   │────│   PostgreSQL    │
│                 │    │                  │    │                 │
│ • Dashboard     │    │ • REST API       │    │ • Time-series   │
│ • Charts        │    │ • Data Collector │    │ • Growth Analysis│
│ • Package Mgmt  │    │ • Growth Engine  │    │ • Historical Data│
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │   NPM Registry   │
                       │                  │
                       │ • Package Info   │
                       │ • Download Stats │
                       └──────────────────┘
```

## 📋 Prerequisites

- **Node.js** 18+
- **PostgreSQL** 12+
- **npm** or **yarn**

## 🚀 Quick Start

### 1. Clone and Setup

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Database Setup

```bash
# Create PostgreSQL database
createdb npm_dashboard

# Set up environment variables
cd backend
cp .env.example .env

# Edit .env with your database credentials
DB_HOST=localhost
DB_PORT=5432
DB_NAME=npm_dashboard
DB_USER=postgres
DB_PASSWORD=your_password
```

### 3. Initialize Database Schema

```bash
cd backend

# Start the backend (this will auto-create tables)
npm run dev
```

The server will automatically create the database schema on first run.

### 4. Start the Application

Open two terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend runs on http://localhost:3001

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs on http://localhost:5173

## 📊 Usage

### Adding Packages

1. Click **"Add Package"** in the header
2. Either:
   - Enter a package name directly (e.g., `react`, `lodash`)
   - Search for packages using the search feature
3. Click **"Add"** to start tracking

### Viewing Analytics

- **Dashboard Overview**: See aggregate statistics and trending packages
- **Package List**: View all tracked packages with growth indicators
- **Package Details**: Click any package for detailed charts and metrics
- **Time Range**: Adjust time ranges (7d, 30d, 90d) for different perspectives

### Understanding Metrics

- **Growth Score**: Composite metric indicating growth potential (0-5 scale)
- **Weekly Growth Rate**: Percentage change in downloads week-over-week
- **Trend Direction**: `accelerating`, `decelerating`, or `stable`
- **High Growth**: Packages marked as showing exceptional growth

## 🔧 Data Collection

### Manual Collection
```bash
cd backend

# Collect data for all tracked packages
npm run collect collect

# Add a new package
npm run collect add <package-name>

# Collect historical data (90 days)
npm run collect historical <package-name> 90
```

### Example: Getting Started with Sample Data

```bash
# Add some popular packages to track
npm run collect add react
npm run collect add vue
npm run collect add svelte
npm run collect add @angular/core

# Collect their data
npm run collect collect
```

## 🗄️ Database Schema

### Core Tables
- **packages**: Package metadata and tracking info
- **package_downloads**: Daily download statistics (time-series)
- **package_weekly_stats**: Aggregated weekly metrics
- **package_growth_analysis**: Growth analysis results

### Key Views
- **package_summary**: Combined package stats for dashboard
- **trending_packages**: High-growth packages over 30 days

## 📦 API Endpoints

### Packages
- `GET /api/packages` - Get all tracked packages with summaries
- `POST /api/packages` - Add a new package to track
- `DELETE /api/packages/:id` - Remove package from tracking
- `GET /api/packages/:name` - Get detailed package information

### Search
- `GET /api/search?q=<query>` - Search npm packages

## 🚀 Next Steps

This dashboard provides a solid foundation for npm package growth tracking. Key areas for enhancement include:

1. **Growth Analysis Algorithms** - Implement sophisticated trend detection
2. **Automated Data Collection** - Set up scheduled data updates
3. **Alert System** - Notifications for high-growth packages
4. **Advanced Analytics** - Predictive growth modeling
5. **Deployment** - Production-ready hosting setup

The current implementation demonstrates all core concepts and provides a fully functional dashboard for immediate use.

---

**Happy tracking! 📊✨**
