#!/bin/bash

# MemeLaunch 數據庫備份腳本
# 自動備份本地D1數據庫並保留最近10個備份

BACKUP_DIR="/home/user/webapp/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/memelaunch_$TIMESTAMP.sql"

echo "🔄 開始數據庫備份..."

# 創建備份目錄
mkdir -p $BACKUP_DIR

# 導出數據庫
echo "📦 導出數據庫..."
cd /home/user/webapp
npx wrangler d1 export memelaunch-db --local --output "$BACKUP_FILE" 2>&1 | grep -v "wrangler\|─"

# 檢查備份文件
if [ -f "$BACKUP_FILE" ]; then
  FILE_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
  echo "✅ 備份成功: $BACKUP_FILE ($FILE_SIZE)"
  
  # 保留最近10個備份
  BACKUP_COUNT=$(ls -1 $BACKUP_DIR/*.sql 2>/dev/null | wc -l)
  if [ $BACKUP_COUNT -gt 10 ]; then
    echo "🧹 清理舊備份..."
    ls -t $BACKUP_DIR/*.sql | tail -n +11 | xargs -r rm
    echo "✅ 已清理 $(($BACKUP_COUNT - 10)) 個舊備份"
  fi
  
  echo ""
  echo "📊 當前備份列表:"
  ls -lht $BACKUP_DIR/*.sql | head -10
else
  echo "❌ 備份失敗！"
  exit 1
fi

echo ""
echo "🎉 備份完成！"
