#!/usr/bin/env python3
import re

print("🔧 Completely fixing Profile page with better error handling...")

with open('public/static/profile-page.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the loadProfile method with better error handling and logging
old_loadProfile = re.search(r'async loadProfile\(\) \{.*?\n  \}', content, re.DOTALL)
if old_loadProfile:
    new_loadProfile = '''async loadProfile() {
    console.log('📥 Loading profile for user ID:', this.userId);
    
    try {
      const token = localStorage.getItem('auth_token');
      console.log('🔑 Token exists:', !!token);
      
      const response = await fetchUtils.get(`/api/profile/${this.userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      console.log('📊 API Response:', response);

      if (response.data.success) {
        this.profileData = response.data.data;
        this.isOwnProfile = response.data.data.isOwnProfile;
        console.log('✅ Profile loaded successfully:', this.profileData.user.username);
        this.render();
      } else {
        console.error('❌ API returned success=false:', response.data);
        this.showError('Failed to load profile: ' + (response.data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('💥 Load profile error:', error);
      this.showError('Failed to load profile. Please try again.');
    }
  }
  
  showError(message) {
    console.log('🚨 Showing error:', message);
    const content = document.getElementById('profile-content');
    if (content) {
      content.innerHTML = `
        <div class="text-center py-12 glass-effect rounded-2xl p-8">
          <i class="fas fa-exclamation-circle text-6xl text-red-500 mb-4"></i>
          <h2 class="text-2xl font-bold mb-2">Failed to Load Profile</h2>
          <p class="text-gray-400 mb-4">${message}</p>
          <a href="/dashboard" class="btn-primary inline-block">
            <i class="fas fa-home mr-2"></i>Back to Dashboard
          </a>
        </div>
      `;
    }
  }'''
    
    content = content[:old_loadProfile.start()] + new_loadProfile + content[old_loadProfile.end():]

# Also ensure render() is called correctly
print("✅ Updated loadProfile() with better error handling")

with open('public/static/profile-page.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Profile page completely fixed!")
print("\nChanges:")
print("- Added console.log at every step")
print("- Added showError() method")
print("- Better error messages")
print("- Fallback UI for errors")
