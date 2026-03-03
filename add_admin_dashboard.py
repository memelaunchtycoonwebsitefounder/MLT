#!/usr/bin/env python3
"""Add admin dashboard page before export statement"""

admin_page = '''

// Admin Dashboard page
app.get('/admin-dashboard', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="zh-TW">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="icon" type="image/x-icon" href="/favicon.ico">
        <link rel="icon" type="image/svg+xml" href="/favicon.svg">
        <title>管理員儀表板 - MemeLaunch Tycoon</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                background: linear-gradient(135deg, #0A0B0D 0%, #1A1B1F 50%, #0A0B0D 100%);
                min-height: 100vh;
            }
            .stat-card {
                background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
                border: 1px solid #334155;
                transition: all 0.3s ease;
            }
            .stat-card:hover {
                transform: translateY(-2px);
                border-color: #FF6B35;
                box-shadow: 0 4px 20px rgba(255, 107, 53, 0.2);
            }
            .table-container {
                background: #1e293b;
                border: 1px solid #334155;
                border-radius: 12px;
                overflow: hidden;
            }
            .chart-container {
                position: relative;
                height: 300px;
                background: #1e293b;
                border: 1px solid #334155;
                border-radius: 12px;
                padding: 20px;
            }
        </style>
    </head>
    <body class="text-white">
        <!-- Header -->
        <div class="bg-gray-900 border-b border-gray-700 mb-8">
            <div class="container mx-auto px-4 py-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <i class="fas fa-shield-alt text-3xl text-orange-500"></i>
                        <h1 class="text-2xl font-bold">管理員儀表板</h1>
                    </div>
                    <a href="/" class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition">
                        <i class="fas fa-home mr-2"></i>返回首頁
                    </a>
                </div>
            </div>
        </div>

        <div class="container mx-auto px-4 pb-12">
            <!-- Stats Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <!-- Total Users -->
                <div class="stat-card p-6 rounded-xl">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-gray-400 text-sm">總註冊人數</span>
                        <i class="fas fa-users text-2xl text-blue-500"></i>
                    </div>
                    <div class="text-3xl font-bold" id="total-users">-</div>
                    <div class="text-xs text-gray-500 mt-1">所有時間</div>
                </div>

                <!-- Today Users -->
                <div class="stat-card p-6 rounded-xl">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-gray-400 text-sm">今日註冊</span>
                        <i class="fas fa-user-plus text-2xl text-green-500"></i>
                    </div>
                    <div class="text-3xl font-bold" id="today-users">-</div>
                    <div class="text-xs text-gray-500 mt-1">過去 24 小時</div>
                </div>

                <!-- Week Users -->
                <div class="stat-card p-6 rounded-xl">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-gray-400 text-sm">本週註冊</span>
                        <i class="fas fa-calendar-week text-2xl text-purple-500"></i>
                    </div>
                    <div class="text-3xl font-bold" id="week-users">-</div>
                    <div class="text-xs text-gray-500 mt-1">過去 7 天</div>
                </div>

                <!-- Month Users -->
                <div class="stat-card p-6 rounded-xl">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-gray-400 text-sm">本月註冊</span>
                        <i class="fas fa-calendar-alt text-2xl text-orange-500"></i>
                    </div>
                    <div class="text-3xl font-bold" id="month-users">-</div>
                    <div class="text-xs text-gray-500 mt-1">本月至今</div>
                </div>
            </div>

            <!-- Chart -->
            <div class="mb-8">
                <h2 class="text-xl font-bold mb-4">
                    <i class="fas fa-chart-line mr-2 text-orange-500"></i>
                    註冊趨勢（最近 7 天）
                </h2>
                <div class="chart-container">
                    <canvas id="registrationChart"></canvas>
                </div>
            </div>

            <!-- Recent Users Table -->
            <div class="mb-8">
                <h2 class="text-xl font-bold mb-4">
                    <i class="fas fa-clock mr-2 text-orange-500"></i>
                    最近註冊用戶（最新 10 位）
                </h2>
                <div class="table-container">
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead>
                                <tr class="bg-gray-900 border-b border-gray-700">
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">ID</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">用戶名</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">電子郵件</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">註冊時間</th>
                                </tr>
                            </thead>
                            <tbody id="recent-users-table" class="divide-y divide-gray-700">
                                <tr>
                                    <td colspan="4" class="px-6 py-8 text-center text-gray-500">
                                        <i class="fas fa-spinner fa-spin text-2xl mb-2"></i>
                                        <div>載入中...</div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Refresh Button -->
            <div class="text-center">
                <button onclick="loadStats()" class="px-6 py-3 bg-orange-500 hover:bg-orange-600 rounded-lg transition font-semibold">
                    <i class="fas fa-sync-alt mr-2"></i>重新載入數據
                </button>
            </div>
        </div>

        <script>
            let registrationChart = null;

            async function loadStats() {
                try {
                    const response = await fetch('/api/admin/stats/users');
                    if (!response.ok) {
                        throw new Error('Failed to fetch stats');
                    }
                    const data = await response.json();

                    if (!data.success) {
                        throw new Error(data.message || 'API returned error');
                    }

                    const stats = data.data;

                    // Update stats cards
                    document.getElementById('total-users').textContent = stats.total.toLocaleString();
                    document.getElementById('today-users').textContent = stats.today.toLocaleString();
                    document.getElementById('week-users').textContent = stats.week.toLocaleString();
                    document.getElementById('month-users').textContent = stats.month.toLocaleString();

                    // Update recent users table
                    const tableBody = document.getElementById('recent-users-table');
                    if (stats.recent && stats.recent.length > 0) {
                        tableBody.innerHTML = stats.recent.map(user => \`
                            <tr class="hover:bg-gray-800 transition">
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">\${user.id}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm">\${user.username}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-400">\${user.email}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-400">\${new Date(user.created_at).toLocaleString('zh-TW')}</td>
                            </tr>
                        \`).join('');
                    } else {
                        tableBody.innerHTML = \`
                            <tr>
                                <td colspan="4" class="px-6 py-8 text-center text-gray-500">
                                    <i class="fas fa-inbox text-3xl mb-2"></i>
                                    <div>暫無註冊用戶</div>
                                </td>
                            </tr>
                        \`;
                    }

                    // Update chart
                    updateChart(stats.trend);

                } catch (error) {
                    console.error('Error loading stats:', error);
                    alert('載入數據失敗：' + error.message);
                }
            }

            function updateChart(trendData) {
                const ctx = document.getElementById('registrationChart');
                
                // Reverse to show oldest to newest
                const reversedData = [...trendData].reverse();
                
                const labels = reversedData.map(item => {
                    const date = new Date(item.date);
                    return date.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' });
                });
                
                const data = reversedData.map(item => item.count);

                // Destroy existing chart if it exists
                if (registrationChart) {
                    registrationChart.destroy();
                }

                // Create new chart
                registrationChart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: '註冊人數',
                            data: data,
                            borderColor: '#FF6B35',
                            backgroundColor: 'rgba(255, 107, 53, 0.1)',
                            fill: true,
                            tension: 0.4,
                            pointRadius: 4,
                            pointBackgroundColor: '#FF6B35',
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: true,
                                labels: {
                                    color: '#fff'
                                }
                            },
                            tooltip: {
                                mode: 'index',
                                intersect: false
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    color: '#9ca3af',
                                    stepSize: 1
                                },
                                grid: {
                                    color: '#334155'
                                }
                            },
                            x: {
                                ticks: {
                                    color: '#9ca3af'
                                },
                                grid: {
                                    color: '#334155'
                                }
                            }
                        }
                    }
                });
            }

            // Load stats on page load
            loadStats();

            // Auto-refresh every 30 seconds
            setInterval(loadStats, 30000);
        </script>
    </body>
    </html>
  `);
});

'''

file_path = 'src/index.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find the export statement and insert before it
export_pos = content.find('\nexport default app;')

if export_pos > 0:
    # Insert admin page before export
    new_content = content[:export_pos] + admin_page + content[export_pos:]
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print("✅ Admin dashboard page added successfully")
    print(f"   Location: Before 'export default app;'")
    print(f"   Route: /admin-dashboard")
else:
    print("❌ Could not find 'export default app;' statement")
