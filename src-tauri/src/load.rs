use std::{
    os::windows::process::CommandExt,
    process::{Command, Stdio},
};

#[tauri::command]
pub async fn node_check() -> Result<String, String> {
    let cmd_output = Command::new("node")
        .arg("-v")
        .creation_flags(0x08000000)
        .output()
        .map_err(|e| e.to_string())?;

    if cmd_output.status.success() {
        let ver = String::from_utf8_lossy(&cmd_output.stdout);
        Ok(ver.to_string())
    } else {
        Err("Install node.js to run: nodejs.org/en/download".to_string())
    }
}

#[tauri::command]
pub async fn install_dependencies() -> Result<(), String> {
    let cmd_child = Command::new("npm.cmd")
        .arg("install")
        .arg("mineflayer")
        .arg("socket.io")
        .arg("express")
        .arg("--verbose")
        .stdout(Stdio::piped())
        .creation_flags(0x08000000)
        .spawn()
        .map_err(|e| e.to_string())?;

    let child_output = cmd_child.wait_with_output().map_err(|e| e.to_string())?;

    if child_output.status.success() {
        Ok(())
    } else {
        Err(String::from_utf8_lossy(&child_output.stdout).to_string())
    }
}

#[tauri::command]
pub async fn run_express() -> Result<u32, String> {
    let cmd_spawn = Command::new("node")
        .arg("express.js")
        .creation_flags(0x08000000)
        .spawn()
        .map_err(|e| e.to_string())?;

    Ok(cmd_spawn.id())
}
