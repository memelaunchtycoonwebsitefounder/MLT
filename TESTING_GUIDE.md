# Testing Guide
MemeLaunch Tycoon v1.6.0

## Test Account
- Email: simple1770639487@example.com
- Username: simple1770639487
- Password: Simple123!

## URLs to Test

### 1. Authentication
**Login:** https://3000-ialq9sk0j7h42em32rv8h-5634da27.sandbox.novita.ai/login

Steps:
1. Open login page
2. Enter test credentials above
3. Click "登入"
4. Should redirect to /dashboard immediately (no 2s delay)
5. Should NOT loop back to /login

Expected Console Output:
```
Dashboard: Script loaded
Dashboard: Initializing
Dashboard: Token check: Found
Dashboard: Verifying token with API
Dashboard: Authentication successful
```

### 2. Dashboard
**URL:** https://3000-ialq9sk0j7h42em32rv8h-5634da27.sandbox.novita.ai/dashboard

Features to Check:
- ✅ User balance displayed
- ✅ Recent transactions section
- ✅ Trending coins list
- ✅ Quick action buttons
- ✅ No console errors

### 3. Market
**URL:** https://3000-ialq9sk0j7h42em32rv8h-5634da27.sandbox.novita.ai/market

Features to Check:
- ✅ Coin list displayed
- ✅ Pagination works
- ✅ Search/filter functionality
- ✅ Click on coin to view details

### 4. Portfolio (NEW)
**URL:** https://3000-ialq9sk0j7h42em32rv8h-5634da27.sandbox.novita.ai/portfolio

Features to Check:
- ✅ Cash balance shown
- ✅ Total portfolio value
- ✅ Total net worth
- ✅ Holdings table (empty if no holdings)
- ✅ Quick action buttons
- ✅ Refresh button works

### 5. Create Coin
**URL:** https://3000-ialq9sk0j7h42em32rv8h-5634da27.sandbox.novita.ai/create

Features to Check:
- ✅ 3-step wizard
- ✅ Image upload
- ✅ Form validation
- ✅ Coin creation works

## Automated Tests

Run the authentication test:
```bash
cd /home/user/webapp
./test-simple-auth.sh
```

Expected Result: 7/7 tests passing

## Common Issues & Solutions

### Issue: Still seeing auth loop
**Solution:** 
1. Clear browser cache and localStorage
2. Open in incognito/private window
3. Check console for errors

### Issue: Images not loading
**Check:**
- Image URL format: `/images/coins/[timestamp]-[random].[ext]`
- R2 bucket configured correctly
- Network tab shows 200 status

### Issue: Portfolio empty
**Note:** This is normal for new accounts
- Buy some coins from market first
- Then check portfolio again

## Browser Requirements
- Modern browser (Chrome, Firefox, Edge, Safari)
- JavaScript enabled
- Cookies/LocalStorage enabled

## Performance Expectations
- Page load: < 2s
- API response: < 500ms
- Auth check: < 200ms
- No memory leaks

## Security Checks
- ✅ Token stored in localStorage
- ✅ Token sent via Authorization header
- ✅ Protected routes require authentication
- ✅ No sensitive data in console logs (tokens masked)

## Next Steps After Testing
If all tests pass:
- ✅ Authentication works smoothly
- ✅ Dashboard displays correctly
- ✅ Portfolio page functional
- ✅ Images load properly

Ready to proceed with Phase 2-4 features:
- Advanced trading simulation
- Social features
- Gamification
- Real-time updates
