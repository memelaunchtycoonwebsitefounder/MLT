/**
 * Email Service using Resend API
 * 
 * Resend Setup Instructions:
 * 1. Sign up at https://resend.com
 * 2. Get your API key from dashboard
 * 3. Add to wrangler.jsonc:
 *    "vars": { "RESEND_API_KEY": "re_..." }
 *    Or use: wrangler secret put RESEND_API_KEY
 * 
 * Free tier: 3,000 emails/month, 100 emails/day
 */

import { Env } from '../types';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send email via Resend API
 */
export async function sendEmail(env: Env, options: SendEmailOptions): Promise<boolean> {
  try {
    if (!env.RESEND_API_KEY) {
      console.warn('[EMAIL] RESEND_API_KEY not configured, skipping email send');
      return false;
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: env.EMAIL_FROM || 'MemeLaunch Tycoon <noreply@memelaunchtycoon.com>',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[EMAIL] Resend API error:', response.status, error);
      return false;
    }

    const result = await response.json();
    console.log('[EMAIL] Email sent successfully:', result);
    return true;

  } catch (error: any) {
    console.error('[EMAIL] Send email error:', error.message);
    return false;
  }
}

/**
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(env: Env, username: string, email: string): Promise<boolean> {
  const html = `
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>歡迎加入 MemeLaunch Tycoon！</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0A0B0D;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; max-width: 90%; border-collapse: collapse; background: linear-gradient(135deg, #1e293b 0%, #334155 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.3);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #FF6B35 0%, #F97316 100%); padding: 40px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">
                                🚀 歡迎加入 MemeLaunch Tycoon！
                            </h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px; color: #e2e8f0;">
                            <p style="margin: 0 0 20px; font-size: 18px; color: #ffffff;">
                                嗨 <strong>${username}</strong>！👋
                            </p>
                            
                            <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6;">
                                感謝你加入 <strong>MemeLaunch Tycoon</strong> - 最有趣的迷因幣交易模擬平台！
                            </p>
                            
                            <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6;">
                                你已經獲得了：
                            </p>
                            
                            <div style="background: rgba(255, 107, 53, 0.1); border-left: 4px solid #FF6B35; padding: 20px; margin: 20px 0; border-radius: 8px;">
                                <div style="margin-bottom: 10px; font-size: 16px;">
                                    💰 <strong>$10,000</strong> 虛擬交易資金
                                </div>
                                <div style="font-size: 16px;">
                                    🪙 <strong>10,000 MLT</strong> 平台代幣
                                </div>
                            </div>
                            
                            <p style="margin: 20px 0; font-size: 16px; line-height: 1.6;">
                                現在開始你的交易之旅吧！
                            </p>
                            
                            <!-- CTA Button -->
                            <table role="presentation" style="margin: 30px 0;">
                                <tr>
                                    <td style="border-radius: 8px; background: linear-gradient(135deg, #FF6B35 0%, #F97316 100%);">
                                        <a href="https://memelaunchtycoon.com/dashboard" style="display: inline-block; padding: 16px 32px; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 16px;">
                                            🎮 開始交易
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <div style="margin: 30px 0; padding: 20px; background: rgba(59, 130, 246, 0.1); border-radius: 8px; border: 1px solid rgba(59, 130, 246, 0.2);">
                                <p style="margin: 0 0 15px; font-size: 16px; font-weight: bold; color: #60a5fa;">
                                    📚 新手提示：
                                </p>
                                <ul style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8;">
                                    <li>先觀察市場趨勢，再做交易決定</li>
                                    <li>使用止損功能保護你的資金</li>
                                    <li>參與社群討論，學習交易策略</li>
                                    <li>完成每日任務，獲取額外獎勵</li>
                                </ul>
                            </div>
                            
                            <p style="margin: 30px 0 0; font-size: 14px; color: #94a3b8; line-height: 1.6;">
                                如有任何問題，歡迎聯繫我們的支援團隊。祝你交易愉快！🎉
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background: #0f172a; padding: 30px; text-align: center; border-top: 1px solid #334155;">
                            <p style="margin: 0 0 15px; font-size: 14px; color: #94a3b8;">
                                <a href="https://memelaunchtycoon.com" style="color: #FF6B35; text-decoration: none; margin: 0 10px;">🏠 首頁</a>
                                <a href="https://memelaunchtycoon.com/market" style="color: #FF6B35; text-decoration: none; margin: 0 10px;">📊 市場</a>
                                <a href="https://memelaunchtycoon.com/leaderboard" style="color: #FF6B35; text-decoration: none; margin: 0 10px;">🏆 排行榜</a>
                            </p>
                            <p style="margin: 15px 0 0; font-size: 12px; color: #64748b;">
                                © 2026 MemeLaunch Tycoon. All rights reserved.<br>
                                這是一個模擬交易平台，沒有真實金融價值。
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
  `;

  const text = `
歡迎加入 MemeLaunch Tycoon！

嗨 ${username}！

感謝你加入 MemeLaunch Tycoon - 最有趣的迷因幣交易模擬平台！

你已經獲得了：
💰 $10,000 虛擬交易資金
🪙 10,000 MLT 平台代幣

現在開始你的交易之旅吧：
https://memelaunchtycoon.com/dashboard

新手提示：
- 先觀察市場趨勢，再做交易決定
- 使用止損功能保護你的資金
- 參與社群討論，學習交易策略
- 完成每日任務，獲取額外獎勵

如有任何問題，歡迎聯繫我們的支援團隊。祝你交易愉快！

---
MemeLaunch Tycoon
https://memelaunchtycoon.com
  `;

  return await sendEmail(env, {
    to: email,
    subject: '🎉 歡迎加入 MemeLaunch Tycoon！開始你的交易之旅',
    html,
    text
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(env: Env, email: string, resetToken: string): Promise<boolean> {
  const resetLink = `https://memelaunchtycoon.com/reset-password?token=${resetToken}`;
  
  const html = `
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>重置密碼</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0A0B0D;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; max-width: 90%; border-collapse: collapse; background: linear-gradient(135deg, #1e293b 0%, #334155 100%); border-radius: 16px; overflow: hidden;">
                    <tr>
                        <td style="background: linear-gradient(135deg, #FF6B35 0%, #F97316 100%); padding: 40px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">
                                🔐 重置密碼
                            </h1>
                        </td>
                    </tr>
                    
                    <tr>
                        <td style="padding: 40px; color: #e2e8f0;">
                            <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6;">
                                我們收到了重置你密碼的請求。點擊下面的按鈕來設置新密碼：
                            </p>
                            
                            <table role="presentation" style="margin: 30px 0;">
                                <tr>
                                    <td style="border-radius: 8px; background: linear-gradient(135deg, #FF6B35 0%, #F97316 100%);">
                                        <a href="${resetLink}" style="display: inline-block; padding: 16px 32px; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 16px;">
                                            重置密碼
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 20px 0; font-size: 14px; color: #94a3b8;">
                                或複製此鏈接到瀏覽器：<br>
                                <span style="color: #60a5fa; word-break: break-all;">${resetLink}</span>
                            </p>
                            
                            <div style="margin: 30px 0; padding: 20px; background: rgba(239, 68, 68, 0.1); border-radius: 8px; border: 1px solid rgba(239, 68, 68, 0.2);">
                                <p style="margin: 0; font-size: 14px; color: #fca5a5;">
                                    ⚠️ 此鏈接將在 1 小時後過期。如果你沒有請求重置密碼，請忽略此郵件。
                                </p>
                            </div>
                        </td>
                    </tr>
                    
                    <tr>
                        <td style="background: #0f172a; padding: 30px; text-align: center; border-top: 1px solid #334155;">
                            <p style="margin: 0; font-size: 12px; color: #64748b;">
                                © 2026 MemeLaunch Tycoon. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
  `;

  return await sendEmail(env, {
    to: email,
    subject: '🔐 重置你的 MemeLaunch Tycoon 密碼',
    html
  });
}
