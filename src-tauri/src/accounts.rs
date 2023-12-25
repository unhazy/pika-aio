use std::{
    fs::{read, write, OpenOptions},
    io::Write,
    str::from_utf8,
};

#[tauri::command]
pub async fn write_to_file(account_str: &str) -> Result<(), String> {
    let mut file = OpenOptions::new()
        .append(true)
        .create(true)
        .open("accounts.txt")
        .map_err(|e| e.to_string())?;

    let data_to_write = "\n".to_owned() + account_str;

    let _ = file
        .write_all(data_to_write.as_bytes())
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn read_file() -> Result<Vec<String>, String> {
    let file_data = read("accounts.txt").map_err(|e| e.to_string())?;
    let file_str = from_utf8(&file_data).map_err(|e| e.to_string())?;

    let lines = file_str.lines().map(String::from).collect();

    Ok(lines)
}

#[tauri::command]
pub async fn remove_acc(acc: &str) -> Result<(), String> {
    let mut current_accs = read_file().await?;

    current_accs.retain(|account| account != acc);

    write("accounts.txt", current_accs.join("\n")).map_err(|e| e.to_string())?;

    Ok(())
}
