// 注册全局快捷键
import { register } from "@tauri-apps/api/globalShortcut";

async function registerGlobalShortcut() {
  await register("Command+Control+B", () => {
    // window.alert("dddd");
  });
}

registerGlobalShortcut();
