// 防止在 Windows 上运行时额外弹出一个 cmd 命令行窗口
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    sky_blog::run();
}
