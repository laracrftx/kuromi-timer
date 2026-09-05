const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('kuromi', {
  minimize: () => ipcRenderer.send('window-minimize'),
  close: () => ipcRenderer.send('window-close'),
  notifyTimerFinished: (phase) => ipcRenderer.send('timer-finished', { phase })
});
