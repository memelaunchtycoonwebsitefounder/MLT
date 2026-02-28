#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Translate comments-simple.js - Comment system for coin detail page
"""

def translate_comments():
    file_path = 'public/static/comments-simple.js'
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    translations = [
        # Error messages
        ("this.renderError('載入失敗');", "this.renderError('Load failed');"),
        ("this.renderError('載入評論失敗');", "this.renderError('Failed to load comments');"),
        ("this.renderError('載入評論失敗: '", "this.renderError('Failed to load comments: '"),
        ("alert('操作失敗');", "alert('Operation failed');"),
        
        # Comment section title
        ("評論 (${this.comments.length})", "Comments (${this.comments.length})"),
        
        # Form placeholders
        ('placeholder="發表您的評論..."', 'placeholder="Write your comment..."'),
        ('placeholder="輸入回覆..."', 'placeholder="Write your reply..."'),
        
        # Buttons
        ("發表</button>", "Post</button>"),
        ("發表回覆", "Post Reply"),
        
        # Sort buttons
        ("<i class=\"fas fa-clock mr-1\"></i>最新", "<i class=\"fas fa-clock mr-1\"></i>Latest"),
        ("<i class=\"fas fa-fire mr-1\"></i>熱門", "<i class=\"fas fa-fire mr-1\"></i>Popular"),
        
        # Comment actions
        ("<i class=\"fas fa-reply mr-1\"></i>回覆", "<i class=\"fas fa-reply mr-1\"></i>Reply"),
        ("<i class=\"fas fa-edit mr-1\"></i>編輯", "<i class=\"fas fa-edit mr-1\"></i>Edit"),
        ("<i class=\"fas fa-trash mr-1\"></i>刪除", "<i class=\"fas fa-trash mr-1\"></i>Delete"),
        ("<i class=\"fas fa-flag mr-1\"></i>舉報", "<i class=\"fas fa-flag mr-1\"></i>Report"),
        
        # Cancel buttons
        ('<button class="cancel-reply-btn px-3 py-1 text-sm bg-gray-600 hover:bg-gray-700 rounded transition">取消</button>',
         '<button class="cancel-reply-btn px-3 py-1 text-sm bg-gray-600 hover:bg-gray-700 rounded transition">Cancel</button>'),
        ('<button class="cancel-edit-btn px-3 py-1 text-sm bg-gray-600 hover:bg-gray-700 rounded transition">取消</button>',
         '<button class="cancel-edit-btn px-3 py-1 text-sm bg-gray-600 hover:bg-gray-700 rounded transition">Cancel</button>'),
        
        # Status labels
        ("'<span class=\"text-gray-500 text-xs\">(已編輯)</span>'", "'<span class=\"text-gray-500 text-xs\">(Edited)</span>'"),
        ("'<span class=\"text-yellow-500 text-sm\"><i class=\"fas fa-thumbtack mr-1\"></i>已釘選</span>'",
         "'<span class=\"text-yellow-500 text-sm\"><i class=\"fas fa-thumbtack mr-1\"></i>Pinned</span>'"),
        
        # Empty state
        ("<p class=\"text-gray-400\">還沒有評論，成為第一個發表評論的人吧！</p>",
         "<p class=\"text-gray-400\">No comments yet, be the first to comment!</p>"),
        
        # Login prompt
        ("<p class=\"text-xl text-gray-300 mb-6\">登入後即可查看和發表評論</p>",
         "<p class=\"text-xl text-gray-300 mb-6\">Login to view and post comments</p>"),
        ("立即登入</a>", "Login Now</a>"),
        
        # Reload button
        ("重新載入</button>", "Reload</button>"),
        
        # Alert messages
        ("alert('請輸入評論內容');", "alert('Please enter comment content');"),
        ("alert('請輸入回覆內容');", "alert('Please enter reply content');"),
        ("alert('發表失敗：'", "alert('Post failed: '"),
        ("alert('回覆失敗：'", "alert('Reply failed: '"),
        
        # Success messages
        ("this.showSuccess('評論發表成功！');", "this.showSuccess('Comment posted successfully!');"),
        ("this.showSuccess('回覆發表成功！');", "this.showSuccess('Reply posted successfully!');"),
    ]
    
    replaced = 0
    for old, new in translations:
        if old in content:
            content = content.replace(old, new)
            replaced += 1
            print(f"✓ {old[:50]}")
        else:
            print(f"✗ Not found: {old[:50]}")
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"\n✅ Comments translation complete! {replaced}/{len(translations)} replaced")

if __name__ == '__main__':
    translate_comments()
