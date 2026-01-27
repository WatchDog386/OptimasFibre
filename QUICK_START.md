# 🚀 QUICK START - How to Run OPTIMAS

## ⚠️ IMPORTANT: Start Backend First!

The console errors you're seeing are because the **backend server is not running**. Follow these steps to fix everything:

---

## 1️⃣ Start Backend Server

Open a terminal and run:

```bash
cd backend
npm run dev
```

You should see:
```
✅ MongoDB Connected: ...
🚀 Server running on port 10000
🌍 ENV: development
🔌 MongoDB Connection Established
```

**⚠️ DO NOT proceed until you see these messages!**

---

## 2️⃣ Start Frontend Server

Open a **NEW terminal** in the root folder and run:

```bash
npm run dev
```

You should see:
```
  ➜  Local:   http://localhost:5173/
```

---

## ✅ All Console Errors Will Disappear

Once both servers are running:
- ❌ ~~ERR_CONNECTION_REFUSED~~ → FIXED
- ❌ ~~Network error during token verification~~ → FIXED  
- ❌ ~~User not authenticated spam~~ → FIXED
- ⚠️ "Download React DevTools" → Just a suggestion (harmless)

---

## 📱 Login Credentials

Use either account:
- **Email**: `fanteskorri36@gmail.com` | **Password**: `fantes36`
- **Email**: `info@optimas.co.ke` | **Password**: `@Optimas$12`

After login, you'll see:
- Dashboard with personalized welcome (Felix Ochieng or Boisley)
- Clean console with NO errors
- All features working

---

## 🔧 API Configuration

**Backend**: `http://localhost:10000`
**Frontend**: `http://localhost:5173`

Both are already configured in:
- `.env.local` (frontend)
- `backend/.env` (backend)

---

## ❓ Troubleshooting

### Still seeing connection refused?
1. Check if backend terminal shows "Server running on port 10000"
2. Try refreshing the page after backend is fully started
3. Check `.env.local` has `VITE_API_BASE_URL=http://localhost:10000`

### MongoDB connection error?
1. Verify MongoDB is running locally
2. Check `MONGODB_URI` in `backend/.env` is correct
3. Try connecting to MongoDB Atlas instead

---

**That's it! Start the backend, start the frontend, login, and enjoy! 🎉**
