#!/usr/bin/env python3
import re

# Read the file
with open('public/static/comments-simple.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Hardcoded English strings to replace with i18n
replacements = [
    # Comments header and placeholders
    ('Comments (', 'i18n.t("coinDetail.comments") + " ('),
    ('Write your comment...', '" + i18n.t("coinDetail.writeComment") + "'),
    ('Post', '" + i18n.t("coinDetail.post") + "'),
    
    # Sort buttons
    ('Latest', '" + i18n.t("coinDetail.latest") + "'),
    ('Popular', '" + i18n.t("coinDetail.popular") + "'),
    
    # No comments message
    ('No comments yet. Be the first to comment!', '" + i18n.t("coinDetail.noComments") + "'),
    
    # Comment actions
    ('Reply', '" + i18n.t("coinDetail.reply") + "'),
    ('Edit', '" + i18n.t("coinDetail.edit") + "'),
    ('Delete', '" + i18n.t("coinDetail.delete") + "'),
    ('Report', '" + i18n.t("coinDetail.report") + "'),
    
    # Edited label
    ('edited', '" + i18n.t("coinDetail.edited") + "'),
    
    # Reply input
    ('Write a reply...', '" + i18n.t("coinDetail.writeReply") + "'),
    ('Cancel', '" + i18n.t("coinDetail.cancel") + "'),
    ('Submit Reply', '" + i18n.t("coinDetail.submitReply") + "'),
    
    # Alerts
    ('Please enter a comment', '" + i18n.t("coinDetail.enterComment") + "'),
    ('Comment posted successfully!', '" + i18n.t("coinDetail.commentSuccess") + "'),
    ('Failed to post comment', '" + i18n.t("coinDetail.commentFailed") + "'),
    ('Please enter a reply', '" + i18n.t("coinDetail.enterReply") + "'),
    ('Reply posted successfully!', '" + i18n.t("coinDetail.replySuccess") + "'),
    ('Failed to post reply', '" + i18n.t("coinDetail.replyFailed") + "'),
    ('Comment updated successfully!', '" + i18n.t("coinDetail.commentUpdated") + "'),
    ('Failed to update comment', '" + i18n.t("coinDetail.updateFailed") + "'),
    ('Are you sure you want to delete this comment?', '" + i18n.t("coinDetail.confirmDelete") + "'),
    ('Comment deleted successfully!', '" + i18n.t("coinDetail.deleteSuccess") + "'),
    ('Failed to delete comment', '" + i18n.t("coinDetail.deleteFailed") + "'),
    ('Operation failed', '" + i18n.t("coinDetail.operationFailed") + "'),
    
    # Login prompt
    ('Login to view and post comments', '" + i18n.t("coinDetail.loginToComment") + "'),
    ('Sign In', '" + i18n.t("coinDetail.signIn") + "'),
    
    # Error messages
    ('Load failed', '" + i18n.t("coinDetail.loadFailed") + "'),
    ('Failed to load comments', '" + i18n.t("coinDetail.loadCommentsFailed") + "'),
    ('Reload', '" + i18n.t("coinDetail.reload") + "'),
]

# Apply replacements
for old, new in replacements:
    # Escape special regex characters in old string
    old_escaped = re.escape(old)
    # Replace in strings (both single and double quotes)
    content = re.sub(f'(["\']){old_escaped}(["\'])', f'(typeof i18n !== "undefined" ? {new} : "{old}")', content)

# Write back
with open('public/static/comments-simple.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Comments i18n fixed!")
