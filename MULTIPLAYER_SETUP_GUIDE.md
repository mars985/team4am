# 🎮 Complete Multiplayer Setup Guide

## 🚀 Fastest Way to Play (30 Seconds)

### 1. Start Servers (if not running)
```bash
# Terminal 1
cd engine-backend && npm run dev

# Terminal 2
cd engine-frontend && npm run dev
```

### 2. Open Two Browser Tabs
```
Tab 1: http://localhost:5173/dots  ← You are Player 1 (Blue)
Tab 2: http://localhost:5173/dots  ← You are Player 2 (Red)
```

### 3. Play!
- Switch between tabs to play as each player
- Or ask a friend to control one tab

---

## 📖 Detailed Methods

### Method 1: Two Browser Tabs (Same Browser)
**Best for: Testing alone**

```
┌─────────────────────────────────────┐
│  Chrome Browser                     │
├─────────────────────────────────────┤
│ Tab 1: localhost:5173/dots          │
│ → Player 1 (Blue) 🔵                │
├─────────────────────────────────────┤
│ Tab 2: localhost:5173/dots          │
│ → Player 2 (Red) 🔴                 │
└─────────────────────────────────────┘
```

**Steps:**
1. Open Chrome
2. Go to `http://localhost:5173/dots`
3. Open new tab (Ctrl+T)
4. Go to `http://localhost:5173/dots` again
5. Switch between tabs to play

---

### Method 2: Regular + Incognito Window
**Best for: Testing with separate sessions**

```
┌─────────────────────────────────────┐
│  Regular Window                     │
│  localhost:5173/dots                │
│  → Player 1 (Blue) 🔵               │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Incognito Window (Ctrl+Shift+N)    │
│  localhost:5173/dots                │
│  → Player 2 (Red) 🔴                │
└─────────────────────────────────────┘
```

**Steps:**
1. Regular window: `http://localhost:5173/dots`
2. Press Ctrl+Shift+N (Chrome) or Ctrl+Shift+P (Firefox)
3. Incognito window: `http://localhost:5173/dots`
4. Arrange windows side-by-side

---

### Method 3: Two Different Browsers
**Best for: Side-by-side play**

```
┌─────────────────────┐  ┌─────────────────────┐
│  Chrome             │  │  Firefox            │
│  localhost:5173/dots│  │  localhost:5173/dots│
│  Player 1 (Blue) 🔵 │  │  Player 2 (Red) 🔴  │
└─────────────────────┘  └─────────────────────┘
```

**Steps:**
1. Chrome: `http://localhost:5173/dots`
2. Firefox: `http://localhost:5173/dots`
3. Arrange side-by-side

---

### Method 4: Two Computers (Same WiFi)
**Best for: Real multiplayer with friend**

```
┌─────────────────────────────────────┐
│  Computer 1 (Host)                  │
│  IP: 192.168.1.100                  │
├─────────────────────────────────────┤
│  Backend: localhost:5000            │
│  Frontend: localhost:5173           │
│  Browser: localhost:5173/dots       │
│  → Player 1 (Blue) 🔵               │
└─────────────────────────────────────┘
              ↓
         WiFi Network
              ↓
┌─────────────────────────────────────┐
│  Computer 2 (Friend)                │
│  IP: 192.168.1.101                  │
├─────────────────────────────────────┤
│  Browser: 192.168.1.100:5173/dots   │
│  → Player 2 (Red) 🔴                │
└─────────────────────────────────────┘
```

**Steps:**

**Computer 1 (Host):**
1. Find your IP address:
   ```bash
   # Windows
   ipconfig
   # Look for IPv4: 192.168.1.100
   
   # Mac/Linux
   ifconfig | grep "inet "
   ```

2. Start servers:
   ```bash
   cd engine-backend && npm run dev
   cd engine-frontend && npm run dev
   ```

3. Open: `http://localhost:5173/dots`

**Computer 2 (Friend):**
1. Open browser
2. Go to: `http://192.168.1.100:5173/dots`
   (Replace with host's IP)

---

### Method 5: Mobile + Desktop
**Best for: Testing mobile experience**

```
┌─────────────────────────────────────┐
│  Desktop (Host)                     │
│  IP: 192.168.1.100                  │
│  localhost:5173/dots                │
│  → Player 1 (Blue) 🔵               │
└─────────────────────────────────────┘
              ↓
         WiFi Network
              ↓
┌─────────────────────────────────────┐
│  📱 Mobile Phone                    │
│  192.168.1.100:5173/dots            │
│  → Player 2 (Red) 🔴                │
└─────────────────────────────────────┘
```

**Steps:**
1. Desktop: Start servers
2. Desktop: Find IP (e.g., 192.168.1.100)
3. Mobile: Connect to same WiFi
4. Mobile: Open `http://192.168.1.100:5173/dots`

---

## 🎯 What You'll See

### Player 1 (First to Join)
```
┌─────────────────────────────────────┐
│  ✅ You are Player 1 (blue)         │
├─────────────────────────────────────┤
│  🔵 Player 1's turn (Your turn!)    │
│                                     │
│  [Game Board]                       │
│                                     │
│  Drag between dots to draw lines    │
└─────────────────────────────────────┘
```

### Player 2 (Second to Join)
```
┌─────────────────────────────────────┐
│  ✅ You are Player 2 (red)          │
├─────────────────────────────────────┤
│  🔵 Player 1's turn                 │
│  Waiting for other player...        │
│                                     │
│  [Game Board]                       │
└─────────────────────────────────────┘
```

---

## 🎮 Gameplay Flow

```
1. Player 1 joins
   ↓
   Assigned Blue (Player 1)
   ↓
   "Your turn!"

2. Player 2 joins
   ↓
   Assigned Red (Player 2)
   ↓
   "Waiting..."

3. Player 1 draws line
   ↓
   Turn switches
   ↓
   "Player 2's turn"

4. Player 2 draws line
   ↓
   Turn switches
   ↓
   "Player 1's turn"

5. Player completes box
   ↓
   Scores +1 point
   ↓
   Gets another turn!

6. All boxes filled
   ↓
   Game Over
   ↓
   Winner announced!
```

---

## 🔧 Troubleshooting

### Problem: "Connecting to game..." forever

**Solution:**
```bash
# Check backend is running
cd engine-backend
npm run dev
# Should see: "Server running on port 5000"

# Check frontend is running
cd engine-frontend
npm run dev
# Should see: "Local: http://localhost:5173"
```

### Problem: Second player not connecting

**Solution:**
1. Refresh both browser windows
2. Make sure both use exact same URL
3. Check browser console (F12) for errors

### Problem: "Not your turn" error

**Solution:**
- This is normal! Wait for other player's turn
- Check turn indicator at top of screen

### Problem: Playing on two computers not working

**Solution:**
1. Both computers on same WiFi? ✅
2. Firewall blocking ports? Check Windows Firewall
3. Using correct IP address? Run `ipconfig` again
4. Try: `http://[IP]:5173/dots` not `https://`

---

## 📊 Quick Reference

| Method | Difficulty | Best For |
|--------|-----------|----------|
| Two Tabs | ⭐ Easy | Solo testing |
| Regular + Incognito | ⭐ Easy | Solo testing |
| Two Browsers | ⭐⭐ Easy | Side-by-side |
| Two Computers | ⭐⭐⭐ Medium | Real multiplayer |
| Mobile + Desktop | ⭐⭐⭐ Medium | Mobile testing |

---

## 🎉 You're Ready!

**Simplest way:**
1. Open two browser tabs
2. Both go to: `http://localhost:5173/dots`
3. Play!

**Questions?**
- Check `HOW_TO_PLAY_MULTIPLAYER.md` for more details
- Check `BOTH_GAMES_COMPLETE.md` for full documentation

Have fun! 🎮
