#!/usr/bin/env python3
"""Update admin dashboard to show real users vs AI traders"""

import re

file_path = 'src/index.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find the stats grid section and add Real Users and AI Traders cards
old_stats_grid = '''            <!-- Stats Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <!-- Total Users -->
                <div class="stat-card p-6 rounded-xl">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-gray-400 text-sm">總註冊人數</span>
                        <i class="fas fa-users text-2xl text-blue-500"></i>
                    </div>
                    <div class="text-3xl font-bold" id="total-users">-</div>
                    <div class="text-xs text-gray-500 mt-1">所有時間</div>
                </div>'''

new_stats_grid = '''            <!-- Stats Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <!-- Real Users -->
                <div class="stat-card p-6 rounded-xl">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-gray-400 text-sm">真實用戶</span>
                        <i class="fas fa-user-check text-2xl text-green-500"></i>
                    </div>
                    <div class="text-3xl font-bold" id="real-users">-</div>
                    <div class="text-xs text-gray-500 mt-1">實際註冊</div>
                </div>
                
                <!-- AI Traders -->
                <div class="stat-card p-6 rounded-xl">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-gray-400 text-sm">AI 交易員</span>
                        <i class="fas fa-robot text-2xl text-purple-500"></i>
                    </div>
                    <div class="text-3xl font-bold" id="ai-traders">-</div>
                    <div class="text-xs text-gray-500 mt-1">模擬帳號</div>
                </div>'''

content = content.replace(old_stats_grid, new_stats_grid)

# Update the JavaScript to handle new data
old_js = '''                    const stats = data.data;

                    // Update stats cards
                    document.getElementById('total-users').textContent = stats.total.toLocaleString();
                    document.getElementById('today-users').textContent = stats.today.toLocaleString();
                    document.getElementById('week-users').textContent = stats.week.toLocaleString();
                    document.getElementById('month-users').textContent = stats.month.toLocaleString();'''

new_js = '''                    const stats = data.data;

                    // Update stats cards
                    document.getElementById('real-users').textContent = stats.realUsers.toLocaleString();
                    document.getElementById('ai-traders').textContent = stats.aiTraders.toLocaleString();
                    document.getElementById('today-users').textContent = stats.today.toLocaleString();
                    document.getElementById('week-users').textContent = stats.week.toLocaleString();
                    document.getElementById('month-users').textContent = stats.month.toLocaleString();'''

content = content.replace(old_js, new_js)

# Update chart title
old_chart_title = '''                <h2 class="text-xl font-bold mb-4">
                    <i class="fas fa-chart-line mr-2 text-orange-500"></i>
                    註冊趨勢（最近 7 天）
                </h2>'''

new_chart_title = '''                <h2 class="text-xl font-bold mb-4">
                    <i class="fas fa-chart-line mr-2 text-orange-500"></i>
                    真實用戶註冊趨勢（最近 7 天）
                </h2>'''

content = content.replace(old_chart_title, new_chart_title)

# Update recent users table title
old_table_title = '''                <h2 class="text-xl font-bold mb-4">
                    <i class="fas fa-clock mr-2 text-orange-500"></i>
                    最近註冊用戶（最新 10 位）
                </h2>'''

new_table_title = '''                <h2 class="text-xl font-bold mb-4">
                    <i class="fas fa-clock mr-2 text-orange-500"></i>
                    最近註冊的真實用戶（最新 10 位）
                </h2>'''

content = content.replace(old_table_title, new_table_title)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Admin dashboard updated successfully")
print("   - Added Real Users card")
print("   - Added AI Traders card")
print("   - Updated stats grid to 5 columns")
print("   - Updated chart and table titles")
