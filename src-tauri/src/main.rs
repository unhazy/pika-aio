#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;

mod accounts;
mod config;
mod load;

#[derive(Clone, serde::Serialize)]
struct Payload {
    args: Vec<String>,
    cwd: String,
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, argv, cwd| {
            app.emit_all("single-instance", Payload { args: argv, cwd })
                .unwrap();
        }))
        .invoke_handler(tauri::generate_handler![
            accounts::write_to_file,
            accounts::read_file,
            accounts::remove_acc,
            config::fetch_config,
            config::edit_config,
            load::node_check,
            load::install_dependencies,
            load::run_express
        ])
        .run(tauri::generate_context!())
        .expect("Error while running rust backend.");
}
