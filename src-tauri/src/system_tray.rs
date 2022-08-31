use tauri::{AppHandle, CustomMenuItem, SystemTrayEvent, SystemTrayMenu, SystemTrayMenuItem};
use tauri::SystemTray;

// 初始化系统托盘
pub fn init() -> SystemTray {
    let preferences = CustomMenuItem::new("preferences".to_string(), "偏好设置");
    let shot = CustomMenuItem::new("shot".to_string(), "截图");
    let quit = CustomMenuItem::new("quit".to_string(), "退出");
    let tray_menu = SystemTrayMenu::new()
        .add_item(preferences)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(shot)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(quit);

    SystemTray::new().with_menu(tray_menu)
}

pub fn on_system_tray_event(_: &AppHandle, event: SystemTrayEvent) {
    match event {
        SystemTrayEvent::MenuItemClick { id, .. } => {
            match id.as_str() {
                "preferences" => {}
                "shot" => {}
                "quit" => {
                    // 退出系统
                    std::process::exit(0);
                }
                _ => {}
            }
        }
        _ => {}
    }
}