import http from 'k6/http';
import { check } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 100 },  // 前 10 秒：拉升到 100 個併發用戶
    { duration: '5s', target: 300 },   // 中間 5 秒：加壓到 300 個併發用戶
    { duration: '5s', target: 0 },     // 最後 5 秒：快速收尾降回 0
  ],

  insecureSkipTLSVerify: true,         // 忽略 SSL 憑證
  discardResponseBodies: true,
};

export default function () {
  // 發送 GET 請求
  const res = http.get('https://www.__.__.tw/main/index.aspx');

  // 僅檢查狀態碼，減少本機 CPU 消耗
  check(res, {
    'Success (200)': (r) => r.status === 200,
  });
}
