/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import * as dotenv from 'dotenv';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskComplete,
  createTaskGroup,
  getTaskGroups,
  updateTaskGroup,
  deleteTaskGroup,
  connectMongoDB,
  disconnectMongoDB,
  type CreateTaskInput,
  type CreateTaskGroupInput,
} from './db';

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Connect to MongoDB on startup
connectMongoDB().catch((error) => {
  log.error('Failed to connect to MongoDB:', error);
});

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

// Database IPC handlers
ipcMain.handle('db:get-tasks', async (_event, includeCompleted: boolean, groupId?: string) => {
  try {
    return await getTasks(includeCompleted, groupId);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
});

ipcMain.handle('db:create-task', async (_event, taskData: CreateTaskInput) => {
  try {
    return await createTask(taskData);
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
});

ipcMain.handle('db:update-task', async (_event, id: string, data: Partial<CreateTaskInput & { completed?: boolean }>) => {
  try {
    return await updateTask(id, data);
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
});

ipcMain.handle('db:delete-task', async (_event, id: string) => {
  try {
    return await deleteTask(id);
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
});

ipcMain.handle('db:toggle-task', async (_event, id: string) => {
  try {
    return await toggleTaskComplete(id);
  } catch (error) {
    console.error('Error toggling task:', error);
    throw error;
  }
});

// Task Group IPC handlers
ipcMain.handle('db:get-groups', async () => {
  try {
    return await getTaskGroups();
  } catch (error) {
    console.error('Error fetching task groups:', error);
    throw error;
  }
});

ipcMain.handle('db:create-group', async (_event, groupData: CreateTaskGroupInput) => {
  try {
    return await createTaskGroup(groupData);
  } catch (error) {
    console.error('Error creating task group:', error);
    throw error;
  }
});

ipcMain.handle('db:update-group', async (_event, id: string, data: Partial<CreateTaskGroupInput>) => {
  try {
    return await updateTaskGroup(id, data);
  } catch (error) {
    console.error('Error updating task group:', error);
    throw error;
  }
});

ipcMain.handle('db:delete-group', async (_event, id: string) => {
  try {
    return await deleteTaskGroup(id);
  } catch (error) {
    console.error('Error deleting task group:', error);
    throw error;
  }
});


// Handle window resize
ipcMain.on('resize-window', async (_event, arg) => {
  if (mainWindow) {
    const [height] = arg as [number];
    const [width] = mainWindow.getSize();

    // Respect min/max bounds
    const minHeight = 120;
    const maxHeight = 800; // Increased to accommodate form
    const constrainedHeight = Math.max(minHeight, Math.min(maxHeight, height));

    mainWindow.setSize(width, constrainedHeight, true);
  }
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug').default();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 320,
    height: 140,
    minWidth: 280,
    minHeight: 120,
    maxWidth: 500,
    maxHeight: 800, // Increased to accommodate form
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
    alwaysOnTop: true,
    frame: false,
    transparent: false,
    resizable: true,
    skipTaskbar: true, // Hide from taskbar and recent apps
    minimizable: true,
    maximizable: false,
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', async () => {
  // Disconnect Prisma before quitting
  await disconnectMongoDB();
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', async () => {
  await disconnectMongoDB();
});

app
  .whenReady()
  .then(() => {
    if (app.isPackaged) {
      app.setLoginItemSettings({
        openAtLogin: true,
      });
    }
    createWindow();

    // Beep every hour
    setInterval(() => {
      const date = new Date();
      if (date.getMinutes() === 0 && date.getSeconds() === 0) {
        shell.beep();
      }
    }, 1000);

    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
