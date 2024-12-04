const { contextBridge, ipcRenderer } = require('electron');

// Expose APIs to the renderer process
contextBridge.exposeInMainWorld('electron', {
  saveFileDialog: () => ipcRenderer.invoke('dialog:save-file'), // Invoke the save dialog
});
