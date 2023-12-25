use serde::{Deserialize, Serialize};
use std::{
    fs::OpenOptions,
    io::{Read, Write},
};

#[derive(Deserialize, Serialize)]
pub struct Config {
    ign: String,
    pass: String,
    mode: String,
    kit_module: bool,
    collect_once: bool,
    main_online: bool,
    first_join: bool,
    is_async: bool,
    is_afk: bool,
}

#[tauri::command]
pub async fn fetch_config() -> Result<Config, String> {
    let mut cfg_file = OpenOptions::new()
        .write(true)
        .read(true)
        .create(true)
        .open("config.toml")
        .map_err(|e| e.to_string())?;

    let mut cfg_str = String::new();
    cfg_file
        .read_to_string(&mut cfg_str)
        .map_err(|e| e.to_string())?;

    let cfg_parsed = toml::from_str(&cfg_str);

    match cfg_parsed {
        Ok(cfg) => return Ok(cfg),
        Err(_) => {
            let default_cfg = Config {
                ign: "Default".to_string(),
                pass: "Default".to_string(),
                mode: "opp".to_string(),
                kit_module: false,
                collect_once: false,
                main_online: false,
                first_join: false,
                is_async: false,
                is_afk: false,
            };

            let toml_str = toml::to_string(&default_cfg).map_err(|e| e.to_string())?;

            let ftoml = format_toml(toml_str);

            cfg_file.set_len(0).map_err(|e| e.to_string())?;

            cfg_file
                .write_all(ftoml.as_bytes())
                .map_err(|e| e.to_string())?;

            Ok(default_cfg)
        }
    }
}

#[tauri::command]
pub async fn edit_config(edit: Config) -> Result<(), String> {
    let mut cfg_file = OpenOptions::new()
        .write(true)
        .create(true)
        .open("config.toml")
        .map_err(|e| e.to_string())?;

    let new_toml = toml::to_string(&edit).map_err(|e| e.to_string())?;

    let ftoml = format_toml(new_toml);

    cfg_file.set_len(0).map_err(|e| e.to_string())?;

    cfg_file
        .write_all(ftoml.as_bytes())
        .map_err(|e| e.to_string())?;

    Ok(())
}

fn format_toml(raw_str: String) -> String {
    raw_str
        .lines()
        .map(|line| line.trim())
        .filter(|line| !line.is_empty())
        .collect::<Vec<&str>>()
        .join("\n")
}
