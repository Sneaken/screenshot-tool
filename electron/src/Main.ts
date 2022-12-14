import {
  app,
  BrowserWindow,
  BrowserWindowConstructorOptions,
  Menu,
  MenuItemConstructorOptions,
  protocol,
  screen,
} from "electron";

const windowOptions: BrowserWindowConstructorOptions = {
  autoHideMenuBar: true,
  webPreferences: {
    webSecurity: false,
    allowRunningInsecureContent: true,
    nodeIntegration: true,
    contextIsolation: false,
    defaultEncoding: "UTF-8",
  },
  frame: false,
  fullscreenable: true,
  movable: true,
  enableLargerThanScreen: true,
};

const editMenu: MenuItemConstructorOptions = {
  label: "Edit",
  submenu: [],
};

function relaunch() {
  app.relaunch();
  app.quit();
}

class Main {
  private window: BrowserWindow | undefined;

  createAppMenu() {
    const applicationMenu: MenuItemConstructorOptions = {
      label: "Application",
      submenu: [
        {
          label: "Quit",
          accelerator: process.platform === "darwin" ? "Command+Q" : "Alt+Q",
          click: () => {
            app.quit();
          },
        },
      ],
    };

    const fullScreenMenu: MenuItemConstructorOptions[] = [
      {
        label: "Toggle Full Screen",
        accelerator: process.platform === "darwin" ? "Cmd+Ctrl+F" : "F11",
        click: () => {
          if (this.window) {
            if (this.window.isFullScreen()) {
              this.window.setFullScreen(false);
              this.window.setMenuBarVisibility(true);
            } else {
              this.window.setFullScreen(true);
              this.window.setMenuBarVisibility(false);
            }
          }
        },
      },
    ];

    const displays = screen.getAllDisplays();
    if (displays.length > 1) {
      fullScreenMenu.push({
        label: "Toggle Span",
        click: () => {
          if (this.window) {
            if (this.window.isFullScreen()) {
              this.window.setFullScreen(false);
            }
            const maxSpan = {
              x: 0,
              y: 0,
              width: 0,
              height: 0,
            };
            displays.forEach((display) => {
              if (maxSpan.x > display.bounds.x) maxSpan.x = display.bounds.x;
              if (maxSpan.y > display.bounds.y) maxSpan.y = display.bounds.y;
              maxSpan.width = Math.max(
                maxSpan.width,
                display.bounds.width + display.bounds.x - 1
              );
              maxSpan.height = Math.max(
                maxSpan.height,
                display.bounds.height + display.bounds.y - 1
              );
            });
            if (this.window.isResizable()) {
              this.window.setMenuBarVisibility(false);
              this.window.setMovable(false);
              this.window.setResizable(false);
              this.window.setBounds(maxSpan);
            } else {
              this.window.setMenuBarVisibility(true);
              this.window.setMovable(true);
              this.window.setResizable(true);
              this.window.setSize(
                Math.round(displays[0].workArea.width * 0.8),
                Math.round(displays[0].workArea.height * 0.8)
              );
              this.window.center();
            }
          }
        },
      });
    }

    const viewMenu: MenuItemConstructorOptions = {
      label: "View",
      submenu: [
        {
          label: "Refresh",
          accelerator: "CmdOrCtrl+R",
          role: "reload",
        },
        {
          label: "Back",
          accelerator: "CmdOrCtrl+Backspace",
          click: () => {},
        },
        {
          type: "separator",
        },
        ...fullScreenMenu,
        {
          type: "separator",
        },
        {
          label: "Toggle Developer Tools",
          accelerator: process.platform === "darwin" ? "Cmd+Alt+I" : "F12",
          role: "toggleDevTools",
        },
      ],
    };

    Menu.setApplicationMenu(
      Menu.buildFromTemplate([applicationMenu, editMenu, viewMenu])
    );
  }

  createWindow() {
    const window = new BrowserWindow({
      ...windowOptions,
      width: 1280,
      height: 800,
    });
    this.window = window;

    window.setAlwaysOnTop(true, "screen-saver");
    // ????????????
    window.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

    window.on("closed", () => {
      this.window = undefined;
    });

    // ????????????????????????
    window.webContents.on("render-process-gone", (_) => {
      window.reload();
    });

    window.on("unresponsive", () => {
      window.reload();
    });

    if (process.env.DEBUG_URL) {
      try {
        // electron ??? ?????????
        require("electron-reloader")(module, {});
      } catch (_) {}
      window.webContents.openDevTools();
      window.loadURL(process.env.DEBUG_URL).catch(console.log);
    } else {
      window.loadFile("./app/renderer/index.html").catch(console.log);
    }
  }

  run() {
    // ????????????
    const gotTheLock = app.requestSingleInstanceLock();
    if (!gotTheLock) {
      app.quit();
      return;
    }

    protocol.registerSchemesAsPrivileged([
      { scheme: "file", privileges: { secure: true, standard: true } },
    ]);

    app.on("second-instance", () => {
      // ???????????????????????????,???????????????????????????????????????
      if (this.window) {
        if (this.window.isMinimized()) this.window.restore();
        this.window.focus();
      }
    });

    app.on("window-all-closed", () => {
      if (process.platform !== "darwin") {
        app.quit();
      }
    });

    app.on("activate", () => {
      if (this.window === undefined) {
        this.createWindow();
      }
    });

    process.on("uncaughtException", () => {
      relaunch();
    });

    process.on("unhandledRejection", () => {
      relaunch();
    });

    app.on("ready", () => {
      this.createWindow();
      this.createAppMenu();
    });
  }
}

export default Main;
