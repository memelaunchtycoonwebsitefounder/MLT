#!/bin/bash

TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUsImVtYWlsIjoicXVpY2t0ZXN0QGV4YW1wbGUuY29tIiwidXNlcm5hbWUiOiJRdWlja1Rlc3QiLCJpYXQiOjE3NzA4MDgwOTMsImV4cCI6MTc3MTQxMjg5M30.pVobGIbSCKrv4w0puoyURdCsuxf-04yLhzCgq1S9VRE"
USER_ID=5

echo "=== 用戶資料系統完整測試 ==="

echo -e "\n【1/6】獲取用戶資料"
curl -s "http://localhost:3000/api/profile/$USER_ID" \
  -H "Authorization: Bearer $TOKEN" | head -300

echo -e "\n\n【2/6】更新用戶資料"
curl -s -X PATCH http://localhost:3000/api/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"bio":"我是MemeLaunch用戶 🚀","location":"Taiwan","website":"https://memelaunch.com","twitter_handle":"@memelaunch"}'

echo -e "\n\n【3/6】獲取交易記錄"
curl -s "http://localhost:3000/api/profile/$USER_ID/trades?limit=5" \
  -H "Authorization: Bearer $TOKEN" | head -200

echo -e "\n\n【4/6】獲取成就"
curl -s "http://localhost:3000/api/profile/$USER_ID/achievements" \
  -H "Authorization: Bearer $TOKEN" | head -200

echo -e "\n\n【5/6】關注用戶1"
curl -s -X POST http://localhost:3000/api/profile/1/follow \
  -H "Authorization: Bearer $TOKEN"

echo -e "\n\n【6/6】獲取關注列表"
curl -s "http://localhost:3000/api/profile/$USER_ID/following?limit=10" \
  -H "Authorization: Bearer $TOKEN"

echo -e "\n\n✅ 所有測試完成！"
