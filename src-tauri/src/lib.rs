use rusqlite::{params, Connection, Result};
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Emitter, Manager, State,
};

// 离线消息数据结构
#[derive(Debug, Serialize, Deserialize)]
pub struct LocalMessage {
    pub id: String,
    pub sender_name: String,
    pub sender_id: Option<String>,
    pub content: String,
    pub msg_type: String,
    pub file_url: Option<String>,
    pub chat_id: String,
    pub created_at: String,
}

// 本地数据库句柄（互斥锁保证线程安全）
pub struct DbState(pub Mutex<Option<Connection>>);

// 初始化 SQLite 数据库 WAL 模式
fn init_sqlite(app_handle: &AppHandle) -> Result<Connection, String> {
    let app_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?;
    std::fs::create_dir_all(&app_dir).map_err(|e| e.to_string())?;
    let db_path = app_dir.join("chat_offline.db");

    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;

    // 开启预写日志 (WAL) 模式提升高并发读写性能
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

// 供前端调用的离线消息写入指令
#[tauri::command]
fn save_local_message(state: State<'_, DbState>, msg: LocalMessage) -> Result<(), String> {
    let lock = state.0.lock().map_err(|e| e.to_string())?;
    if let Some(conn) = lock.as_ref() {
        conn.execute(
            "INSERT OR REPLACE INTO local_messages (id, sender_name, sender_id, content, msg_type, file_url, chat_id, created_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
            params![
                msg.id,
                msg.sender_name,
                msg.sender_id,
                msg.content,
                msg.msg_type,
                msg.file_url,
                msg.chat_id,
                msg.created_at
            ],
        )
        .map_err(|e| e.to_string())?;
    }
    Ok(())
}

// 供前端调用的获取本地离线消息指令
#[tauri::command]
fn get_local_messages(
    state: State<'_, DbState>,
    chat_id: String,
    limit: i32,
) -> Result<Vec<LocalMessage>, String> {
    let lock = state.0.lock().map_err(|e| e.to_string())?;
    if let Some(conn) = lock.as_ref() {
        let mut stmt = conn
            .prepare(
                "SELECT id, sender_name, sender_id, content, msg_type, file_url, chat_id, created_at
                 FROM local_messages WHERE chat_id = ?1 ORDER BY created_at ASC LIMIT ?2",
            )
            .map_err(|e| e.to_string())?;

        let rows = stmt
            .query_map(params![chat_id, limit], |row| {
                Ok(LocalMessage {
                    id: row.get(0)?,
                    sender_name: row.get(1)?,
                    sender_id: row.get(2)?,
                    content: row.get(3)?,
                    msg_type: row.get(4)?,
                    file_url: row.get(5)?,
                    chat_id: row.get(6)?,
                    created_at: row.get(7)?,
                })
            })
            .map_err(|e| e.to_string())?;

        let mut list = Vec::new();
        for r in rows {
            if let Ok(m) = r {
                list.push(m);
            }
        }
        return Ok(list);
    }
    Ok(vec![])
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .manage(DbState(Mutex::new(None)))
        .setup(|app| {
            // 初始化本地 SQLite
            let conn = init_sqlite(app.handle())?;
            let db_state = app.state::<DbState>();
            *db_state.0.lock().unwrap() = Some(conn);

            // 配置系统托盘右键菜单
            let quit_i = MenuItem::with_id(app, "quit", "退出 Sky-Blog", true, None::<&str>)?;
            let show_i = MenuItem::with_id(app, "show", "显示主界面", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show_i, &quit_i])?;

            // 构建系统托盘图标与点击事件
            let _tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .show_menu_on_left_click(false)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "quit" => {
                        app.exit(0);
                    }
                    "show" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                })
                .build(app)?;

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            save_local_message,
            get_local_messages
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}