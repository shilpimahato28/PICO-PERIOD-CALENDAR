# Step 2: PostgreSQL Database Setup - Detailed Guide

## Option A: If PostgreSQL is Already Installed

### 1. Open PostgreSQL Command Line (psql)

**Method 1: Using Command Prompt/PowerShell**
```bash
psql -U postgres
```

**Method 2: Using pgAdmin (GUI)**
- Open pgAdmin from Start Menu
- Right-click on "Databases" → "Create" → "Database"

### 2. Create the Database

In psql, run:
```sql
CREATE DATABASE pico_period_tracker;
```

To verify it was created:
```sql
\l
```

You should see `pico_period_tracker` in the list.

Exit psql:
```sql
\q
```

### 3. Create the .env File

In your project root directory (same folder as `package.json`), create a file named `.env` with this content:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/pico_period_tracker
SESSION_SECRET=change-this-to-a-random-secret-key-in-production
PORT=5000
```

**Important:** Replace `YOUR_PASSWORD` with your actual PostgreSQL password.

**Example:**
If your password is `mypassword123`, it would look like:
```env
DATABASE_URL=postgresql://postgres:mypassword123@localhost:5432/pico_period_tracker
```

---

## Option B: If PostgreSQL is NOT Installed

### 1. Download and Install PostgreSQL

1. Go to: https://www.postgresql.org/download/windows/
2. Download the installer (usually "Download the installer")
3. Run the installer
4. During installation:
   - **Remember the password** you set for the `postgres` user (you'll need this!)
   - Keep the default port: `5432`
   - Keep the default installation directory

### 2. Verify Installation

Open Command Prompt or PowerShell and type:
```bash
psql --version
```

You should see a version number.

### 3. Create the Database

Open PostgreSQL Command Line:
```bash
psql -U postgres
```

Enter your password when prompted.

Then create the database:
```sql
CREATE DATABASE pico_period_tracker;
```

Verify:
```sql
\l
```

Exit:
```sql
\q
```

### 4. Create the .env File

In your project root directory, create `.env` file:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/pico_period_tracker
SESSION_SECRET=change-this-to-a-random-secret-key-in-production
PORT=5000
```

Replace `YOUR_PASSWORD` with the password you set during PostgreSQL installation.

---

## Connection String Format Explained

The `DATABASE_URL` format is:
```
postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME
```

- **USERNAME**: Usually `postgres` (default superuser)
- **PASSWORD**: The password you set during installation
- **HOST**: `localhost` (if running locally)
- **PORT**: `5432` (default PostgreSQL port)
- **DATABASE_NAME**: `pico_period_tracker`

---

## Troubleshooting

### "psql: command not found"
- PostgreSQL might not be in your PATH
- Try using pgAdmin instead (GUI tool)
- Or add PostgreSQL's bin folder to your system PATH

### "password authentication failed"
- Make sure you're using the correct password
- If you forgot it, you may need to reset it or reinstall PostgreSQL

### "database already exists"
- That's okay! The database is already created. You can skip the CREATE DATABASE step.

### "connection refused"
- Make sure PostgreSQL service is running
- On Windows: Check Services → PostgreSQL should be running
- Or restart PostgreSQL service

---

## Next Steps

After creating the `.env` file, proceed to:
- **Step 3**: Run `npm run db:push` to create tables
- **Step 4**: Run the development server
