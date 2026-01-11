# Troubleshooting Guide

## ML Model Not Working

### Issue: "Model file not found" or prediction fails

**Solution:**
1. **Copy your model file:**
   - Copy `pcos_model.pkl` from your PCOS project to `ml_models/pcos_model.pkl`
   - Make sure the file name is exactly `pcos_model.pkl`

2. **Install Python dependencies:**
   ```bash
   pip install -r ml_models/requirements.txt
   ```

3. **Check Python is installed:**
   ```bash
   python --version
   ```
   Should show Python 3.8 or higher

4. **Test the Python script manually:**
   ```bash
   echo '{"logs": [{"startDate": "2024-01-01", "endDate": "2024-01-05"}, {"startDate": "2024-01-29", "endDate": "2024-02-02"}]}' | python ml_models/predict_period.py
   ```

5. **Check server console** for detailed error messages when you try to generate a prediction

### Common ML Model Errors:

- **"Python not found"**: Install Python 3.8+ and add it to PATH
- **"Module not found"**: Run `pip install -r ml_models/requirements.txt`
- **"Model file not found"**: Make sure `pcos_model.pkl` is in `ml_models/` folder
- **Prediction returns error**: Check the server console for Python error details

**Note:** If the ML model fails, the system will automatically fallback to a simple cycle average calculation.

---

## Chat/Community Page Not Working

### Issue: Can't see rooms or send messages

**Solution:**

1. **Check if rooms exist:**
   - The app should auto-create default rooms on first run
   - Check your database: `SELECT * FROM rooms;`
   - If empty, restart the server (it seeds data on startup)

2. **Check browser console:**
   - Open Developer Tools (F12)
   - Look for errors in the Console tab
   - Check the Network tab for failed API requests

3. **Check server console:**
   - Look for error messages when you try to send a message
   - Check if database queries are failing

4. **Common issues:**

   **"Failed to fetch rooms"**
   - Check if you're logged in
   - Check server is running
   - Check database connection

   **"Failed to send message"**
   - Check if you've already sent a message today (1 message per day limit)
   - Check server console for detailed error
   - Verify database connection

   **"Rate limit exceeded"**
   - You can only send 1 message per day per room
   - This is by design for privacy/safety

5. **Database check:**
   ```sql
   -- Check if rooms exist
   SELECT * FROM rooms;
   
   -- Check if messages table exists
   SELECT * FROM chat_messages LIMIT 5;
   ```

6. **Reset/Seed data:**
   - Restart the server - it will seed default rooms if they don't exist
   - Or manually insert rooms:
   ```sql
   INSERT INTO rooms (name, description) VALUES 
   ('Wellness Chat', 'General discussion about women''s health and wellness.'),
   ('Cycle Support', 'Support and tips for dealing with period symptoms.');
   ```

---

## General Debugging Steps

1. **Check server console** - Most errors will show here
2. **Check browser console** (F12) - Frontend errors
3. **Check Network tab** - See API request/response details
4. **Verify database connection** - Make sure `.env` has correct `DATABASE_URL`
5. **Restart server** - Many issues are fixed by restarting

---

## Still Not Working?

1. Share the **exact error message** from:
   - Server console
   - Browser console (F12)
   - Network tab (if API calls are failing)

2. Check:
   - Is the server running?
   - Is the database connected?
   - Are you logged in?
   - Do you have at least 2 period logs (for predictions)?
