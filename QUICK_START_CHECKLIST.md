# ✅ QUICK START CHECKLIST

Copy this checklist and check off each step as you complete it:

## 🎯 Phase 1: Database Setup (5 minutes)

### Step 1: Open Supabase Dashboard

- [ ] Go to https://app.supabase.com/
- [ ] Find your project (should show "cusiltcmhkkcwynydpjy")
- [ ] Click on your project to open it

### Step 2: Run Migration Script

- [ ] Click "SQL Editor" in the left sidebar
- [ ] Click "New Query"
- [ ] Open the file `migration-script-fixed.sql` in VS Code
- [ ] Copy ALL the content (Ctrl+A, then Ctrl+C)
- [ ] Paste it into the Supabase SQL Editor
- [ ] Click "Run" button
- [ ] Wait for green "Migration completed successfully! ✅" message

### Step 3: Create Storage Bucket

- [ ] Click "New Query" again in SQL Editor
- [ ] Open the file `storage-setup.sql` in VS Code
- [ ] Copy ALL the content and paste it
- [ ] Click "Run" button
- [ ] Wait for green "Storage setup completed successfully! ✅" message

## 🎯 Phase 2: Test Application (5 minutes)

### Step 4: Start Development Server

- [ ] Open terminal in VS Code (Terminal → New Terminal)
- [ ] Run: `npm run dev`
- [ ] Wait for "Local: http://localhost:5173" message
- [ ] Click the link or go to http://localhost:5173

### Step 5: Test Database Connection

- [ ] Look for green "Database Integration Test" box at top of page
- [ ] Should show "✅ Database connection successful"
- [ ] If you see errors, check Supabase dashboard

### Step 6: Test User Authentication

- [ ] Try to sign up with a test email (like test@example.com)
- [ ] Check if you can log in
- [ ] Green box should show "✅ User authentication working"

## 🎯 Phase 3: Upload Content (5 minutes)

### Step 7: Access Admin Panel

- [ ] Go to http://localhost:5173/admin
- [ ] Upload a test image (any JPG/PNG file)
- [ ] Add title and description
- [ ] Click "Upload Image"

### Step 8: Test Game Flow

- [ ] Go back to main page (http://localhost:5173)
- [ ] Select a topic (History or Culture)
- [ ] Choose difficulty (2x2, 3x3, or 4x4)
- [ ] Start playing a puzzle
- [ ] Complete the puzzle
- [ ] Check if time is saved as "best time"

## 🚨 TROUBLESHOOTING

### If Step 2 Fails:

- Check if all SQL ran without errors
- Look for red error messages in Supabase
- Try running smaller parts of the script

### If Step 4 Shows Errors:

- Check your .env file has correct Supabase credentials
- Make sure all npm packages are installed: `npm install`

### If Authentication Doesn't Work:

- Check Supabase Auth settings
- Make sure RLS policies were created
- Check browser console (F12) for errors

## ✅ SUCCESS!

When everything works, you should see:

- ✅ User can sign up and log in
- ✅ Games create database sessions
- ✅ Best times are tracked
- ✅ Images can be uploaded
- ✅ No errors in browser console

---

**🚀 START HERE:** Go to https://app.supabase.com/ and run the migration script!
