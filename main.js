const electron = require('electron');
const app = electron.app;
const ipc = electron.ipcMain;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mw = null;

function openMainWindow() {
  // Create the browser window.
  mw = new electron.BrowserWindow({width: 375, height: 500});
  mw.loadURL('file://' + __dirname + '/index.html');
  // mw.webContents.openDevTools();
  mw.on('closed', () => {
    mw = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', openMainWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if( process.platform !== 'darwin' ) {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if( mw === null ) {
    openMainWindow();
  }
});

// resize window based on loaded url
(function() {

  let sizeMap = {
        'video': [300, 187],
        'default': [375, 500]
      },
      lastStatus = 'default';

  ipc.on('asynchronous-message', (ev, arg) => {
    if( arg != lastStatus ) {
      let currentSize = mw.getSize(),
          leftTopPosition = mw.getPosition(),
          rightBottomPosition = [leftTopPosition[0] + currentSize[0], leftTopPosition[1] + currentSize[1]],
          targetSize = ( arg in sizeMap ) ? sizeMap[arg] : sizeMap.default,
          targetPosition = [rightBottomPosition[0] - targetSize[0], rightBottomPosition[1] - targetSize[1]];

      mw.setBounds({
        x: targetPosition[0], y: targetPosition[1], width: targetSize[0], height: targetSize[1]
      }, true);
      lastStatus = arg;
    }
  });

})();