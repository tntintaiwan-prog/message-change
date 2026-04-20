# 共享清單工具

這個版本已加入雲端共享能力。前端仍可單機使用，但只要部署一個簡單的 Cloudflare Worker，就能讓多台裝置共用同一份清單。

## 檔案

- `index.html`: 主頁面，包含清單編輯、本機儲存、雲端同步設定
- `cloudflare-worker.js`: 雲端 API 範本
- `manifest.json`、`service-worker.js`: PWA 離線支援

## 最簡單部署教學

如果你是第一次用 Cloudflare，可以照下面做：

1. 打開 [Cloudflare Dashboard](https://dash.cloudflare.com/) 並登入。
2. 左邊找到 `Workers & Pages`。
3. 按 `Create application`。
4. 選 `Create Worker`。
5. 建立完成後，進入這個 Worker。
6. 把原本畫面裡的程式碼全部刪掉。
7. 打開這個專案裡的 `cloudflare-worker.js`。
8. 把 `cloudflare-worker.js` 內容全部貼到 Cloudflare Worker 編輯器。

## 建立儲存空間

這一步是讓雲端能記住你的清單資料：

1. 在 Cloudflare 左側選單找到 `Storage & Databases`。
2. 進入 `KV`。
3. 按 `Create namespace`。
4. 名稱輸入 `SHARED_LISTS`。
5. 建立完成。

## 把 KV 綁到 Worker

1. 回到你的 Worker 頁面。
2. 找到 `Settings`。
3. 找到 `Bindings`。
4. 新增 `KV Namespace Binding`。
5. Variable name 輸入 `SHARED_LISTS`。
6. Namespace 選你剛剛建立的 `SHARED_LISTS`。

## 設定管理金鑰

這把金鑰是用來保護「寫入雲端」功能：

1. 在 Worker 的 `Settings` 裡找到 `Variables`。
2. 新增一個環境變數。
3. 名稱填 `ADMIN_KEY`。
4. 值填你自己設定的一串密碼，例如 `my-secret-123456`。
5. 儲存。

## 發布 Worker

1. 按右上角的 `Deploy`。
2. 發布後，Cloudflare 會給你一個網址。
3. 這個網址就是前端要填的 `雲端 API 網址`。

## 前端怎麼填

開啟 `index.html` 後，填下面三個欄位：

- 雲端 API 網址：貼上 Cloudflare 給你的 Worker 網址
- 共享代碼：自己取一個房間名稱，例如 `team-a`
- 管理金鑰：填你剛剛設定的 `ADMIN_KEY`

如果不同手機、電腦都填一樣的：

- 雲端 API 網址
- 共享代碼

它們就會共用同一份清單。

## 按鈕怎麼用

- `同步到雲端`: 把目前畫面上的清單上傳到雲端
- `從雲端載入`: 把雲端最新清單抓回來
- `啟用自動同步`: 每次新增、刪除、調整順序後自動上傳

## 注意

- 目前是簡單共享模式，規則是最後一次上傳會覆蓋前一次資料。
- 管理金鑰目前保存在瀏覽器本機，適合小型團隊或自用。
- 如果未來你要帳號登入、權限管理、多人同時編輯不互蓋，可以再升級成 Firebase 或 Supabase 版本。
