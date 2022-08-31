#![cfg_attr(
    all(not(debug_assertions), target_os = "macos"),
    windows_subsystem = "macos"
)]

mod system_tray;

fn main() {
    let context = tauri::generate_context!();
    tauri::Builder::default()
        // 不需要 menu 所以用一个新的来覆盖默认值
        .menu(tauri::Menu::new())
        .system_tray(system_tray::init())
        .on_system_tray_event(system_tray::on_system_tray_event)
        .run(context)
        .expect("error while running tauri application");
}
