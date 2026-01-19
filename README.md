# Time Left

A desktop application built with Electron, React, and TypeScript for managing tasks and countdown timers.

## Features

- ⏰ Countdown timer to a target date
- ✅ Task management with groups
- 📅 Due dates and reminders
- 🔄 Repeat tasks (daily, weekly, monthly, yearly)
- 🎨 Light/Dark theme support
- 📦 Task groups with color coding
- 💾 Local MongoDB database storage

## Prerequisites

Before you begin, ensure you have the following installed on your system:

1. **Node.js** (version 14.x or higher)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node --version`
   - Verify npm: `npm --version` (should be 7.x or higher)

2. **MongoDB** (version 4.0 or higher)
   - **Option A: Local MongoDB**
     - Download from [mongodb.com](https://www.mongodb.com/try/download/community)
     - Install and start MongoDB service
   - **Option B: MongoDB Atlas (Cloud)**
     - Create a free account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
     - Create a cluster and get your connection string

3. **Git** (optional, for cloning the repository)
   - Download from [git-scm.com](https://git-scm.com/)

## Installation Guide

### Step 1: Clone or Download the Project

If you have the project in a Git repository:
```bash
git clone <repository-url>
cd time-left
```

If you have the project as a ZIP file:
1. Extract the ZIP file to your desired location
2. Open a terminal/command prompt in the extracted folder

### Step 2: Install Node.js Dependencies

Open a terminal/command prompt in the project root directory and run:

```bash
npm install
```

This will:
- Install all required dependencies
- Build the development DLL files
- Install Electron app dependencies

**Note:** This process may take several minutes. If you encounter errors:
- Make sure you have Node.js 14.x or higher installed
- Try deleting `node_modules` folder and `package-lock.json`, then run `npm install` again
- On Windows, you might need to run the terminal as Administrator

### Step 3: Set Up MongoDB

#### Option A: Using Local MongoDB

1. **Install MongoDB:**
   - Download MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
   - Follow the installation wizard
   - On Windows: MongoDB usually installs as a service and starts automatically
   - On macOS/Linux: Start MongoDB with `mongod` command or as a service

2. **Verify MongoDB is running:**
   ```bash
   # On Windows (PowerShell)
   Get-Service MongoDB
   
   # On macOS/Linux
   sudo systemctl status mongod
   # or
   ps aux | grep mongod
   ```

3. **Default connection string:**
   - The app uses `mongodb://localhost:27017/time-left` by default
   - No additional configuration needed if MongoDB is running locally

#### Option B: Using MongoDB Atlas (Cloud)

1. **Create a MongoDB Atlas account:**
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for a free account

2. **Create a cluster:**
   - Click "Build a Database"
   - Choose the free tier (M0)
   - Select your preferred cloud provider and region
   - Click "Create Cluster"

3. **Set up database access:**
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Create a username and password (save these!)
   - Set user privileges to "Atlas admin" or "Read and write to any database"
   - Click "Add User"

4. **Configure network access:**
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development) or add your IP address
   - Click "Confirm"

5. **Get your connection string:**
   - Go to "Database" in the left sidebar
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (it looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)
   - Replace `<password>` with your actual password
   - Add database name: `mongodb+srv://username:password@cluster.mongodb.net/time-left`

### Step 4: Configure Environment Variables

1. **Create a `.env` file:**
   - In the project root directory, create a new file named `.env`
   - Copy the contents from `env.example`:
     ```bash
     # On Windows (PowerShell)
     Copy-Item env.example .env
     
     # On macOS/Linux
     cp env.example .env
     ```

2. **Edit the `.env` file:**
   - Open `.env` in a text editor
   - Update the `MONGODB_URI` with your MongoDB connection string:
   
   **For local MongoDB:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/time-left
   ```
   
   **For MongoDB Atlas:**
   ```env
   MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/time-left?retryWrites=true&w=majority
   ```
   
   **Important:** Replace `your-username` and `your-password` with your actual MongoDB credentials.

### Step 5: Start the Application

1. **Start the development server:**
   ```bash
   npm start
   ```

2. **What happens:**
   - Webpack will compile the main process and renderer
   - The Electron app window will open automatically
   - The app will connect to MongoDB on startup
   - You should see "✓ MongoDB connected successfully" in the terminal

3. **If you see errors:**
   - **MongoDB connection error:** Check that MongoDB is running and the connection string in `.env` is correct
   - **Port already in use:** Another instance might be running, close it first
   - **Module not found:** Run `npm install` again

### Step 6: Verify Everything Works

1. **Check the app window:**
   - You should see a countdown timer at the top
   - Click "Show Tasks" to expand the tasks panel
   - Click "+ Add" to create a test task
   - Create a task group by clicking "+ Group"

2. **Check the terminal:**
   - Look for "✓ MongoDB connected successfully"
   - No red error messages should appear

## Development

### Available Scripts

- `npm start` - Start the development server and open the app
- `npm run build` - Build the application for production
- `npm run package` - Package the app for distribution
- `npm run lint` - Run ESLint to check code quality
- `npm run lint:fix` - Fix ESLint errors automatically

### Project Structure

```
time-left/
├── src/
│   ├── main/           # Electron main process (backend)
│   │   ├── db.ts       # Database operations
│   │   ├── main.ts     # Main Electron process
│   │   └── models/     # Mongoose models
│   └── renderer/       # React frontend
│       ├── App.tsx     # Main React component
│       ├── api/        # API client
│       └── components/ # React components
├── assets/             # App icons and resources
├── .env               # Environment variables (create this)
├── env.example        # Example environment file
└── package.json       # Dependencies and scripts
```

## Customizing the Countdown Timer

The countdown timer displays the time remaining until a target date. By default, it's set to **July 27, 2030**. You can change this date to any date you want.

### Step 1: Open the App Component File

1. Navigate to `src/renderer/App.tsx` in your project
2. Open the file in your code editor

### Step 2: Find the Countdown Component

Look for the `Countdown` function (around line 60). You'll see two places where the date is set:

1. **The target date calculation** (line ~62):
   ```typescript
   const difference = +new Date('2030-07-27T00:00:00') - +new Date();
   ```

2. **The displayed label** (line ~93):
   ```typescript
   <div className="countdown-label">27 July 2030</div>
   ```

### Step 3: Change the Date

1. **Update the target date:**
   - Change `'2030-07-27T00:00:00'` to your desired date
   - Format: `'YYYY-MM-DDTHH:MM:SS'` (24-hour format)
   - Example: `'2025-12-31T23:59:59'` for New Year's Eve 2025 at 11:59:59 PM
   - Example: `'2024-06-15T00:00:00'` for June 15, 2024 at midnight

2. **Update the displayed label:**
   - Change `"27 July 2030"` to match your new date
   - Format it however you like (e.g., `"December 31, 2025"`, `"June 15, 2024"`)

### Step 4: Save and Restart

1. Save the file (`Ctrl+S` or `Cmd+S`)
2. If the app is running, it will automatically reload
3. If not, restart the app with `npm start`

### Example: Setting Countdown to New Year 2025

```typescript
// In the calculateTimeLeft function:
const difference = +new Date('2025-01-01T00:00:00') - +new Date();

// In the return statement:
<div className="countdown-label">1 January 2025</div>
```

### Example: Setting Countdown to a Specific Time

```typescript
// Countdown to 3:30 PM on December 25, 2024:
const difference = +new Date('2024-12-25T15:30:00') - +new Date();

// Display label:
<div className="countdown-label">25 December 2024, 3:30 PM</div>
```

### Date Format Reference

- **Year:** 4 digits (e.g., `2024`, `2025`)
- **Month:** 2 digits, 01-12 (e.g., `01` for January, `12` for December)
- **Day:** 2 digits, 01-31
- **Hour:** 2 digits, 00-23 (24-hour format, `00` = midnight, `23` = 11 PM)
- **Minute:** 2 digits, 00-59
- **Second:** 2 digits, 00-59

**Full format:** `'YYYY-MM-DDTHH:MM:SS'`

**Note:** The countdown will automatically calculate and display:
- Years
- Months
- Days
- Hours
- Minutes
- Seconds

The timer updates every second automatically.

## Features to Explore

Once you have the app running, here are all the features you can explore:

### 🎯 Countdown Timer

- **Live Countdown:** Real-time countdown to your target date
- **Multiple Time Units:** Displays years, months, days, hours, minutes, and seconds
- **Customizable Target:** Change the target date to any future date (see Customizing section above)
- **Visual Display:** Clean, easy-to-read countdown interface

### ✅ Task Management

#### Creating Tasks
- Click the **"+ Add"** button in the tasks panel
- Fill in the task details:
  - **Title** (required): Name of your task
  - **Description** (optional): Additional notes about the task
  - **Due Date** (optional): When the task should be completed
  - **Priority**: Choose from Low, Normal, or High
  - **Group**: Assign to a task group (or leave ungrouped)

#### Task Properties
- **Priority Levels:**
  - **Low**: For less urgent tasks
  - **Normal**: Default priority level
  - **High**: For important, urgent tasks
  
- **Due Dates:**
  - Set specific due dates for tasks
  - Tasks show "Today" or "Tomorrow" labels when applicable
  - Overdue tasks are highlighted in red
  
- **Reminders:**
  - Enable reminders for important tasks
  - Set both date and time for reminders
  - Tasks with reminders show a "Reminder" badge
  
- **Repeat Tasks:**
  - Make tasks repeat automatically
  - Choose frequency: Daily, Weekly, Monthly, or Yearly
  - Set repeat interval (e.g., every 2 weeks)
  - Optionally set an end date for repeating tasks
  - Tasks with repeat enabled show a "Repeat" badge

#### Viewing Tasks
- **Task List:** See all your incomplete tasks
- **Task Details:** Click any task to view full details in a modal
- **Task Count:** See how many tasks you have at a glance
- **Empty State:** Friendly message when all tasks are complete

#### Editing Tasks
- Click on any task to open the detail view
- Click **"Edit"** button to modify task properties
- Update any field: title, description, due date, priority, group, reminders, or repeat settings
- Changes are saved automatically

#### Completing Tasks
- Click the checkbox next to a task to mark it complete
- Completed tasks are automatically hidden from the main list
- Tasks can be toggled between complete and incomplete

#### Deleting Tasks
- Click the **"×"** button on any task, or
- Open task details and click **"Delete"**
- Confirm deletion in the confirmation dialog
- Deleted tasks are permanently removed

### 📦 Task Groups

#### Creating Groups
- Click **"+ Group"** button in the task groups section
- Enter a group name
- Groups automatically get a random color assigned
- Press Enter or click "Add" to create

#### Group Features
- **Color Coding:** Each group has a unique color for easy identification
- **Task Count:** See how many tasks are in each group
- **Visual Indicators:** Color dots appear next to group names and tasks

#### Filtering by Group
- Click **"All"** to see tasks from all groups
- Click any group chip to filter and see only tasks in that group
- Active group is highlighted
- Task count updates based on selected filter

#### Managing Groups
- **Edit Groups:** Hover over a group chip and click **"Edit"** to rename it
- **Delete Groups:** Hover over a group chip and click **"Delete"** to remove it
- When a group is deleted, all tasks in that group are moved to "No Group"
- If you're viewing a deleted group, the filter automatically switches to "All"

### 🎨 User Interface Features

#### Theme Switching
- **Light/Dark Mode:** Toggle between light and dark themes
- Click the sun/moon icon in the top-right corner
- Theme preference is saved automatically
- Smooth transitions between themes

#### Window Management
- **Expandable Panel:** Click "Show Tasks" to expand the tasks panel
- **Resizable Window:** Drag window edges to resize
- **Always on Top:** Window stays on top of other applications
- **Compact Mode:** Collapse to show only the countdown timer

#### Modals and Dialogs
- **Task Modal:** Clean interface for creating/editing tasks
- **Task Detail Modal:** View complete task information
- **Delete Confirmation:** Safety confirmation before deleting
- **Keyboard Support:** Press `Escape` to close modals
- **Click Outside:** Click outside modals to close them

#### Visual Feedback
- **Loading States:** Spinner while tasks are loading
- **Error Messages:** Clear error messages if something goes wrong
- **Empty States:** Friendly messages when there are no tasks
- **Hover Effects:** Interactive hover states on buttons and tasks
- **Active States:** Visual indication of selected groups and active buttons

### 💾 Data Management

#### Database Storage
- **MongoDB Integration:** All data stored in MongoDB
- **Persistent Storage:** Tasks and groups saved automatically
- **Local or Cloud:** Use local MongoDB or MongoDB Atlas
- **Data Safety:** All changes are saved immediately

#### Task Organization
- **Automatic Sorting:** Tasks sorted by due date and creation date
- **Group Association:** Tasks can belong to groups for better organization
- **Metadata Tracking:** Creation and update timestamps for all items

### ⌨️ Keyboard Shortcuts

- **Escape:** Close any open modal
- **Enter:** Submit forms (when focused on input fields)

### 🔍 Task Filtering and Search

- **Group Filtering:** Filter tasks by group
- **All Tasks View:** See all tasks regardless of group
- **Incomplete Tasks:** Only incomplete tasks are shown by default
- **Task Count Display:** See total number of incomplete tasks

### 📱 Responsive Design

- **Adaptive Layout:** Interface adapts to window size
- **Scrollable Lists:** Long task lists are scrollable
- **Minimum/Maximum Sizes:** Window has sensible size constraints
- **Clean UI:** Modern, minimalist design

### 🎯 Best Practices

1. **Use Groups:** Organize related tasks into groups (e.g., "Work", "Personal", "Shopping")
2. **Set Priorities:** Mark important tasks as "High" priority
3. **Use Due Dates:** Set due dates to track deadlines
4. **Enable Reminders:** Set reminders for time-sensitive tasks
5. **Repeat Tasks:** Use repeat feature for recurring tasks (e.g., weekly meetings, monthly bills)
6. **Keep It Simple:** Don't create too many groups - keep organization simple
7. **Regular Review:** Check your tasks regularly to stay on top of things

### 💡 Tips and Tricks

- **Quick Task Creation:** Use the "+ Add" button for quick task entry
- **Group Colors:** Each group gets a random color - use this for visual organization
- **Task Details:** Click tasks to see full information without editing
- **Theme Preference:** Your theme choice is remembered between sessions
- **Window Size:** Resize the window to your preferred size - it will remember
- **Empty Groups:** Groups with no tasks still appear in the list for future use

## Troubleshooting

### MongoDB Connection Issues

**Problem:** "Error connecting to MongoDB" or "MongoServerError"

**Solutions:**
1. Verify MongoDB is running:
   ```bash
   # Windows
   Get-Service MongoDB
   
   # macOS/Linux
   sudo systemctl status mongod
   ```

2. Check your connection string in `.env`:
   - Make sure there are no extra spaces
   - For Atlas, ensure your IP is whitelisted
   - Verify username and password are correct

3. Test connection manually:
   ```bash
   # Install MongoDB shell (mongosh)
   npm install -g mongosh
   
   # Test local connection
   mongosh mongodb://localhost:27017/time-left
   
   # Test Atlas connection
   mongosh "your-atlas-connection-string"
   ```

### Port Already in Use

**Problem:** "Port 1212 is already in use"

**Solutions:**
1. Close any other instances of the app
2. Find and kill the process using the port:
   ```bash
   # Windows
   netstat -ano | findstr :1212
   taskkill /PID <process-id> /F
   
   # macOS/Linux
   lsof -ti:1212 | xargs kill
   ```

### Build Errors

**Problem:** "Module not found" or webpack errors

**Solutions:**
1. Delete `node_modules` and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. Rebuild DLL files:
   ```bash
   npm run build:dll
   ```

3. Clear webpack cache:
   ```bash
   rm -rf .erb/dll
   npm run build:dll
   ```

### App Window Not Opening

**Problem:** Terminal shows "compiled successfully" but no window appears

**Solutions:**
1. Check for errors in the terminal (scroll up)
2. Check if the window is hidden (check taskbar)
3. Try closing and restarting: `Ctrl+C` then `npm start` again

## Building for Production

To create a distributable version of the app:

```bash
npm run package
```

This will:
- Build the application
- Create installers in `release/build/` directory
- Windows: Creates an `.exe` installer
- macOS: Creates a `.dmg` file
- Linux: Creates an `AppImage`

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/time-left` |

## Technologies Used

- **Electron** - Desktop application framework
- **React** - UI library
- **TypeScript** - Type-safe JavaScript
- **MongoDB** - Database
- **Mongoose** - MongoDB ODM
- **Webpack** - Module bundler

## Support

If you encounter any issues:

1. Check the Troubleshooting section above
2. Verify all prerequisites are installed correctly
3. Check that MongoDB is running and accessible
4. Review the terminal output for error messages

## License

This project is private and proprietary.

