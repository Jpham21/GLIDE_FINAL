const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const path = require("path");

let mainWindow;

app.on("ready", () => {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800, // Minimum width
        minHeight: 600, // Minimum height
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            enableRemoteModule: false,
            nodeIntegration: false,
        },
    });

    mainWindow.loadURL("http://localhost:5173");
    // Load the React build into the Electron window
    mainWindow.loadFile(path.join(__dirname, "../frontend/dist/index.html"));

   mainWindow.webContents.openDevTools();
});

ipcMain.handle('dialog:save-file', async () => {
    const result = await dialog.showSaveDialog({
      title: 'Save Experiment Video',
      defaultPath: 'Untitled.mp4',
      filters: [{ name: 'Videos', extensions: ['mp4'] }],
    });
  
    return result.filePath; // Return the selected file path
  });

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

