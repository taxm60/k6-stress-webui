const express = require('express');
const { spawn } = require('child_process');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const PORT = 3000;
const WS_PORT = 3001;

// 靜態檔案目錄（放前端網頁）
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
    console.log(`Web 伺服器運行中: http://localhost:${PORT}`);
});

// 建立 WebSocket 伺服器
const wss = new WebSocket.Server({ port: WS_PORT });

wss.on('connection', (ws) => {
    console.log('前端已連線 WebSocket');

    ws.on('message', (message) => {
        if (message.toString() === 'start_k6') {
            ws.send(JSON.stringify({ type: 'system', data: '系統：開始執行 k6 壓力測試...\n' }));

            // 執行 k6 指令 (請確保 k6-stress-DoS.js 檔案與此腳本在同一目錄)
            // 使用 --console-output=stdout 確保 log 不會跑到 stderr
            const k6 = spawn('k6', ['run', 'k6-stress-DoS.js']);

            // 捕捉標準輸出
            k6.stdout.on('data', (data) => {
                ws.send(JSON.stringify({ type: 'log', data: data.toString() }));
            });

            // 捕捉錯誤輸出
            k6.stderr.on('data', (data) => {
                ws.send(JSON.stringify({ type: 'error', data: data.toString() }));
            });

            // 執行完畢
            k6.on('close', (code) => {
                ws.send(JSON.stringify({ type: 'system', data: `\n系統：k6 執行完畢，結束代碼: ${code}\n` }));
            });
        }
    });
});
