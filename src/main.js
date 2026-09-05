const { app, BrowserWindow, Tray, Menu, ipcMain, Notification, nativeImage } = require('electron');
const path = require('path');

let mainWindow;
let tray;

const ICON_PATH = path.join(__dirname, '..', 'assets', 'icons', 'icon.png');

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 340,
    height: 520,
    minWidth: 300,
    minHeight: 460,
    resizable: true,
    frame: false, // we draw our own cute titlebar in the renderer
    backgroundColor: '#0f0d13',
    icon: ICON_PATH,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  mainWindow.on('close', (event) => {
    // Hide to tray instead of quitting, unless we're actually quitting the app
    if (!app.isQuiting) {
      event.preventDefault();
      mainWindow.hide();
    }
    return false;
  });
}

function createTray() {
  let trayIcon = nativeImage.createFromPath(ICON_PATH);
  if (trayIcon.isEmpty()) {
    // Fallback so the app doesn't crash before you've dropped in real icons
    trayIcon = nativeImage.createEmpty();
  }
  tray = new Tray(trayIcon.resize({ width: 16, height: 16 }));
  tray.setToolTip('Kuromi Timer');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show Kuromi Timer',
      click: () => {
        mainWindow.show();
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.isQuiting = true;
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);
  tray.on('click', () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  });
}

app.whenReady().then(() => {
  createWindow();
  createTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // On Windows/Linux we still keep the tray alive unless the user quit explicitly.
  }
});

app.on('before-quit', () => {
  app.isQuiting = true;
});

// ---- IPC handlers for the custom titlebar & timer events ----

ipcMain.on('window-minimize', () => {
  mainWindow.minimize();
});

ipcMain.on('window-close', () => {
  mainWindow.hide();
});

ipcMain.on('timer-finished', (event, payload) => {
  const { phase } = payload || {};
  const messages = {
    focus: { title: 'Focus session done!', body: 'Kuromi says: take a break, nyahaha~' },
    break: { title: 'Break\u2019s over!', body: 'Back to work, or Kuromi will prank you.' },
    longBreak: { title: 'Long break\u2019s over!', body: 'Time to lock back in.' }
  };
  const msg = messages[phase] || { title: 'Timer done', body: 'Time\u2019s up!' };

  if (Notification.isSupported()) {
    new Notification({
      title: msg.title,
      body: msg.body,
      icon: ICON_PATH
    }).show();
  }

  if (mainWindow && !mainWindow.isFocused()) {
    mainWindow.flashFrame(true);
  }
});
