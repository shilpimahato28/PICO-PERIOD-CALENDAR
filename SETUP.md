# PiCO Period Tracker - Setup Guide

## Prerequisites

1. **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
2. **PostgreSQL** - [Download here](https://www.postgresql.org/download/windows/)
3. **npm** (comes with Node.js)

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up PostgreSQL Database

1. Install PostgreSQL if you haven't already
2. Create a new database:
   ```sql
   CREATE DATABASE pico_period_tracker;
   ```
3. Note your PostgreSQL connection details:
   - Host: `localhost` (usually)
   - Port: `5432` (default)
   - Database: `pico_period_tracker`
   - Username: `postgres` (or your username)
   - Password: (your PostgreSQL password)

## Step 3: Configure Environment Variables

Create a `.env` file in the root directory with:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/pico_period_tracker
SESSION_SECRET=your-secret-key-here-change-this-in-production
PORT=5000
```

**Important:** Replace `username` and `password` with your actual PostgreSQL credentials.

## Step 4: Run Database Migrations

```bash
npm run db:push
```

This will create all the necessary tables in your database.

## Step 5: Run the Development Server

### On Windows (PowerShell):
```powershell
$env:NODE_ENV="development"; npm run dev
```

### On Windows (Command Prompt):
```cmd
set NODE_ENV=development && npm run dev
```

### Alternative: Use cross-env (recommended)
Install cross-env for cross-platform compatibility:
```bash
npm install --save-dev cross-env
```

Then update `package.json` script to:
```json
"dev": "cross-env NODE_ENV=development tsx server/index.ts"
```

## Step 6: Access the Application

Open your browser and navigate to:
```
http://localhost:5000
```

## Optional: AI Features

If you want to use AI-powered predictions, add these to your `.env`:
```env
AI_INTEGRATIONS_OPENAI_API_KEY=your-openai-api-key
AI_INTEGRATIONS_OPENAI_BASE_URL=https://api.openai.com/v1
```

## Troubleshooting

### Database Connection Error
- Make sure PostgreSQL is running
- Verify your `DATABASE_URL` is correct
- Check that the database exists

### Port Already in Use
- Change the `PORT` in `.env` to a different number (e.g., 5001)
- Or stop the process using port 5000

### Module Not Found Errors
- Run `npm install` again
- Delete `node_modules` and `package-lock.json`, then run `npm install`

## Production Build

To build for production:
```bash
npm run build
npm start
```
