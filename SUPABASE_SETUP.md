# Supabase Database Setup Guide

This guide will help you set up Supabase PostgreSQL database for the Time Left app.

## Prerequisites

- A Supabase account (sign up at [supabase.com](https://supabase.com))
- Node.js and npm installed

## Step 1: Create a Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click **"New Project"**
3. Fill in the project details:
   - **Name**: `time-left-app` (or any name you prefer)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose the closest region to you
4. Click **"Create new project"**
5. Wait for the project to be set up (takes 1-2 minutes)

## Step 2: Get Your Database Connection String

1. In your Supabase project dashboard, go to **Settings** → **Database**
2. Scroll down to the **"Connection string"** section
3. Find the **"URI"** connection string
4. It will look like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```
5. Copy this connection string

## Step 3: Configure Your .env File

1. In your project root, copy the example file:
   ```bash
   cp env.example .env
   ```
   
   Or on Windows:
   ```cmd
   copy env.example .env
   ```

2. Open the `.env` file and add your Supabase connection string:
   ```env
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?schema=public
   ```
   
   **Important**: Replace `[YOUR-PASSWORD]` with the password you created in Step 1, and `[PROJECT-REF]` with your actual project reference.

## Step 4: Run Database Migrations

1. Generate Prisma Client:
   ```bash
   npm run prisma:generate
   ```

2. Push the schema to your database:
   ```bash
   npm run prisma:push
   ```
   
   This will create the `Task` table in your Supabase database.

## Step 5: Verify the Setup

1. Open Prisma Studio to view your database:
   ```bash
   npm run prisma:studio
   ```
   
   This will open a browser window where you can see and manage your tasks.

2. Close Prisma Studio when done (Ctrl+C in terminal)

## Step 6: Start the App

1. Start the development server:
   ```bash
   npm start
   ```

2. The app will now use your Supabase database to store tasks!

## Database Schema

The app creates a `Task` table with the following structure:

- `id` - Unique identifier (UUID)
- `title` - Task title (required)
- `description` - Task description (optional)
- `completed` - Completion status (boolean, default: false)
- `dueDate` - Due date (optional)
- `priority` - Priority level: "low", "normal", or "high" (default: "normal")
- `listName` - List name for organization (optional)
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

## Features

- Create tasks directly in the app
- Tasks are stored in your Supabase database
- Mark tasks as complete/incomplete
- Set due dates for tasks
- Organize tasks with list names

## Troubleshooting

### "Connection refused" Error
- Check that your DATABASE_URL is correct
- Verify your Supabase project is active
- Make sure you're using the correct password

### "Table does not exist" Error
- Run `npm run prisma:push` to create the tables
- Or run `npm run prisma:migrate` to create a migration

### "Prisma Client not generated" Error
- Run `npm run prisma:generate` to generate the client
- Make sure you've installed dependencies: `npm install`

### Database Connection Issues
- Check your Supabase project status in the dashboard
- Verify your IP is not blocked (Supabase allows all IPs by default)
- Check the connection string format is correct

## Security Notes

- **Never commit your `.env` file** - it's already in `.gitignore`
- Keep your database password secure
- The connection string contains your password - treat it as sensitive
- Supabase provides free tier with generous limits for development

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## Next Steps

After setting up the database:
1. Start the app: `npm start`
2. Click "Show Tasks" to expand the tasks panel
3. Click "+ Add" to create your first task
4. Click "+ Add" to create your first task

Enjoy managing your tasks! 🎉

