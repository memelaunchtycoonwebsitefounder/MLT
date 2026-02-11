# 🔒 MemeLaunch 數據備份與恢復策略

## 📋 重要性說明

數據丟失可能由以下原因造成：
1. 數據庫Migration重新應用
2. 開發環境重置
3. 本地D1數據庫(.wrangler)被刪除
4. 服務器故障或沙盒重置

**為防止未來數據丟失，必須建立完整的備份策略！**

---

## 🎯 三層備份策略

### 第一層：本地數據庫定期導出 (最重要)

#### 1. 手動備份腳本
```bash
#!/bin/bash
# backup-database.sh

BACKUP_DIR="/home/user/webapp/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/memelaunch_$TIMESTAMP.sql"

# 創建備份目錄
mkdir -p $BACKUP_DIR

# 導出數據庫
cd /home/user/webapp
npx wrangler d1 export memelaunch-db --local --output "$BACKUP_FILE"

# 保留最近10個備份
ls -t $BACKUP_DIR/*.sql | tail -n +11 | xargs -r rm

echo "✅ 備份完成: $BACKUP_FILE"
```

#### 2. 自動備份（每次重要操作前）
在關鍵操作前執行：
- Migration之前
- 大規模數據導入之前
- 重置數據庫之前
- 重啟服務器之前

#### 3. 恢復方法
```bash
# 從備份恢復
cd /home/user/webapp

# 1. 停止服務
pm2 stop memelaunch

# 2. 清除當前數據庫
rm -rf .wrangler/state/v3/d1

# 3. 重新應用migrations
npx wrangler d1 migrations apply memelaunch-db --local

# 4. 導入備份數據
npx wrangler d1 execute memelaunch-db --local --file=backups/memelaunch_YYYYMMDD_HHMMSS.sql

# 5. 重啟服務
pm2 restart memelaunch
```

---

### 第二層：Git版本控制備份

#### 1. 定期Git提交
```bash
#!/bin/bash
# git-backup.sh

cd /home/user/webapp

# 添加所有更改
git add -A

# 創建帶時間戳的提交
git commit -m "backup: $(date '+%Y-%m-%d %H:%M:%S')"

# 顯示狀態
git log --oneline -5
```

#### 2. 重要文件追蹤
確保以下文件在Git中：
- `migrations/*.sql` - 數據庫結構
- `seed.sql` - 種子數據
- `restore-*.sh` - 恢復腳本
- `*.md` - 文檔

#### 3. .gitignore設置
```gitignore
# 不要忽略備份目錄
!backups/
backups/*.sql

# 但忽略大文件
backups/*.tar.gz
```

---

### 第三層：完整項目備份（ProjectBackup）

#### 1. 使用ProjectBackup工具
```bash
# 通過API調用（假設有這個工具）
# 或手動創建tar包

cd /home/user
tar -czf webapp_backup_$(date +%Y%m%d).tar.gz \
  --exclude='webapp/node_modules' \
  --exclude='webapp/.wrangler' \
  --exclude='webapp/dist' \
  webapp/

# 上傳到安全位置
# cp webapp_backup_*.tar.gz /mnt/aidrive/
```

#### 2. 備份內容
- 所有源代碼
- 數據庫備份
- 配置文件
- 文檔和腳本

---

## 🔄 自動化備份策略

### 創建自動備份腳本

```bash
#!/bin/bash
# auto-backup-all.sh

echo "🔄 開始自動備份流程..."

# 1. 數據庫備份
echo "1️⃣ 備份數據庫..."
/home/user/webapp/backup-database.sh

# 2. Git提交
echo "2️⃣ Git提交..."
cd /home/user/webapp
git add -A
git commit -m "auto-backup: $(date '+%Y-%m-%d %H:%M:%S')" || echo "沒有更改需要提交"

# 3. 創建完整項目備份（每天一次）
HOUR=$(date +%H)
if [ "$HOUR" == "00" ]; then
  echo "3️⃣ 創建完整項目備份..."
  cd /home/user
  tar -czf /mnt/aidrive/webapp_$(date +%Y%m%d).tar.gz \
    --exclude='webapp/node_modules' \
    --exclude='webapp/.wrangler' \
    --exclude='webapp/dist' \
    webapp/
fi

echo "✅ 備份流程完成！"
```

---

## 📊 備份文件管理

### 目錄結構
```
/home/user/webapp/
├── backups/                    # 數據庫SQL備份
│   ├── memelaunch_20260211_120000.sql
│   ├── memelaunch_20260211_130000.sql
│   └── ... (保留最近10個)
├── .git/                       # Git版本控制
├── restore-old-data.sh         # 恢復腳本
├── backup-database.sh          # 備份腳本
└── auto-backup-all.sh          # 自動備份腳本

/mnt/aidrive/                   # AI Drive (遠程存儲)
├── webapp_20260211.tar.gz      # 每日完整備份
├── webapp_20260210.tar.gz
└── ... (保留最近30天)
```

### 清理策略
- 本地數據庫備份：保留最近10個
- Git歷史：保留所有
- 完整項目備份：保留最近30天

---

## 🚨 災難恢復流程

### 場景1：數據庫被意外重置

**症狀**：
- 用戶無法登入
- Market頁面沒有幣種
- Dashboard數據丟失

**恢復步驟**：
```bash
# 1. 停止服務
pm2 stop memelaunch

# 2. 查找最新備份
ls -lt /home/user/webapp/backups/*.sql | head -1

# 3. 恢復數據庫
cd /home/user/webapp
rm -rf .wrangler/state/v3/d1
npx wrangler d1 migrations apply memelaunch-db --local
npx wrangler d1 execute memelaunch-db --local --file=backups/[最新備份].sql

# 4. 重啟服務
pm2 restart memelaunch

# 5. 驗證
./verify-recovery.sh
```

---

### 場景2：整個項目被刪除

**恢復步驟**：
```bash
# 1. 從AI Drive恢復
cd /home/user
cp /mnt/aidrive/webapp_[最新日期].tar.gz .
tar -xzf webapp_[最新日期].tar.gz

# 2. 重新安裝依賴
cd webapp
npm install

# 3. 恢復數據庫
npx wrangler d1 migrations apply memelaunch-db --local
npx wrangler d1 execute memelaunch-db --local --file=backups/[最新備份].sql

# 4. 構建並啟動
npm run build
pm2 start ecosystem.config.cjs
```

---

### 場景3：Migration導致數據丟失

**預防措施**：
```bash
# 執行migration前必須備份！
/home/user/webapp/backup-database.sh

# 然後再執行migration
npx wrangler d1 migrations apply memelaunch-db --local
```

**如果已經丟失**：
使用場景1的恢復流程。

---

## 🔧 立即實施的備份計劃

### 步驟1：創建備份腳本
```bash
cd /home/user/webapp

# 創建備份目錄
mkdir -p backups

# 創建備份腳本
cat > backup-database.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/home/user/webapp/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/memelaunch_$TIMESTAMP.sql"
mkdir -p $BACKUP_DIR
cd /home/user/webapp
npx wrangler d1 export memelaunch-db --local --output "$BACKUP_FILE"
ls -t $BACKUP_DIR/*.sql | tail -n +11 | xargs -r rm
echo "✅ 備份完成: $BACKUP_FILE"
EOF

chmod +x backup-database.sh
```

### 步驟2：立即執行第一次備份
```bash
cd /home/user/webapp
./backup-database.sh
```

### 步驟3：添加到Git
```bash
cd /home/user/webapp
git add backup-database.sh backups/.gitkeep
git commit -m "feat: 添加數據庫自動備份腳本"
```

### 步驟4：設置自動備份習慣
在以下時機執行備份：
- 每次重要開發前
- 每天結束時
- 執行migration前
- 重啟服務前

---

## 📝 備份檢查清單

### 每日備份
- [ ] 執行 `./backup-database.sh`
- [ ] Git提交當天更改
- [ ] 檢查備份文件大小（應該>10KB）

### 每週備份
- [ ] 創建完整項目tar.gz
- [ ] 上傳到AI Drive
- [ ] 驗證備份可以恢復

### 每月備份
- [ ] 清理舊備份文件
- [ ] 測試完整恢復流程
- [ ] 更新恢復文檔

---

## ⚠️ 重要注意事項

### 不要做的事
1. ❌ 不要在沒有備份的情況下執行migration
2. ❌ 不要刪除 `.wrangler` 目錄而不備份
3. ❌ 不要在生產環境測試破壞性操作
4. ❌ 不要依賴單一備份來源

### 必須做的事
1. ✅ 定期執行備份
2. ✅ 測試備份恢復流程
3. ✅ 保留多個備份版本
4. ✅ 使用Git追蹤所有代碼
5. ✅ 將重要備份存儲到AI Drive

---

## 🎯 快速參考

### 備份命令
```bash
# 數據庫備份
./backup-database.sh

# Git備份
git add -A && git commit -m "backup: $(date)"

# 完整項目備份
tar -czf ../webapp_backup.tar.gz --exclude='node_modules' --exclude='.wrangler' --exclude='dist' .
```

### 恢復命令
```bash
# 從SQL恢復數據庫
npx wrangler d1 execute memelaunch-db --local --file=backups/[備份文件].sql

# 從tar恢復項目
tar -xzf webapp_backup.tar.gz
```

### 驗證命令
```bash
# 驗證數據庫
npx wrangler d1 execute memelaunch-db --local --command="SELECT COUNT(*) FROM users; SELECT COUNT(*) FROM coins;"

# 驗證功能
./verify-recovery.sh
```

---

**最重要的建議：現在就執行第一次備份！** 🚨

```bash
cd /home/user/webapp
./backup-database.sh
git add -A
git commit -m "backup: initial backup after data recovery"
```

---

**版本**: v1.0  
**創建日期**: 2026-02-11  
**狀態**: ✅ 立即實施
