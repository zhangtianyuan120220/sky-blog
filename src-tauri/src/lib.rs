use rusqlite::Connection;
use tauri::{AppHandle, Manager, State};

fn init_sqlite(app_handle: &AppHandle) -> Result<Connection, String> {
    let app_dir = app_handle
        .path()
        .app_data_dir()
        .unwrap_or_else(|_| std::env::temp_dir().join("sky-blog"));

    std::fs::create_dir_all(&app_dir).map_err(|e| e.to_string())?;
    let db_path = app_dir.join("chat_offline.db");

    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;

    conn.execute_batch(
        "
        PRAGMA journal_mode = WAL;
        PRAGMA synchronous = NORMAL;
        CREATE TABLE IF NOT EXISTS local_messages (
            id TEXT PRIMARY KEY,
            sender_name TEXT NOT NULL,
            sender_id TEXT,
            content TEXT NOT NULL,
            msg_type TEXT NOT NULL,
            file_url TEXT,
            chat_id TEXT NOT NULL,
            created_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_chat_id ON local_messages(chat_id);
        ",
    )
    .map_err(|e| e.to_string())?;

    Ok(conn)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let handle = app.handle();
            if let Err(e) = init_sqlite(handle) {
                eprintln!("Failed to initialize database: {}", e);
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}