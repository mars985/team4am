# 🎮 How to Play Multiplayer - Join The Dots

## Quick Start (Easiest Method)

### Step 1: Start Servers
```bash
# Terminal 1 - Backend
cd engine-backend
npm run dev

# Terminal 2 - Frontend
cd engine-frontend
npm run dev
```

### Step 2: Open Two Browser Windows

**Method A: Two Regular Tabs**
1. Open Chrome/Firefox
2. Tab 1: Go to `http://localhost:5173/dots`
3. Tab 2: Go to `http://localhost:5173/dots`
4. You'll see "You are Player 1 (blue)" in Tab 1
5. You'll see "You are Player 2 (red)" in Tab 2

**Method B: Regular + Incognito**
1. Regular window: `http://localhost:5173/dots` → Player 1
2. Incognito window (Ctrl+Shift+N): `http://localhost:5173/dots` → Player 2

**Method C: Two Different Browsers**
1. Chrome: `http://localhost:5173/dots` → Player 1
2. Firefox: `http://localhost:5173/dots` → Player 2

## 🎯 How to Play

### Game Rules
1. **Player 1 (Blue)** goes first
2. Click and drag between two adjacent dots to draw a line
3. Complete a box (4 sides) to score a point
4. If you complete a box, you get another turn!
5. Game ends when all boxes are filled
6. Most boxes wins!

### Visual Indicators
- **Your player badge** has a colored ring around it
- **"Your turn!"** appears when it's your turn
- **"Waiting for other player..."** when it's not your turn
- **Green notification** when you're assigned a player number
- **Red notification** if you try to move when it's not your turn

## 🖥️ Playing on Two Computers

### Setup (One Time)

1. **Find Host Computer IP**:
```bash
# Windows
ipconfig
# Look for IPv4 Address (e.g., 192.168.1.100)

# Mac
ifconfig | grep "inet "
# Look for 192.168.x.x address

# Linux
hostname -I
```

2. **Update Frontend Socket URL** (if needed):

Edit `engine-frontend/src/games/join-the-dots/JoinTheDots.tsx`:
```typescript
// Change this line:
const SOCKET_URL = "http://localhost:5000";

// To your IP:
const SOCKET_URL = "http://192.168.1.100:5000";
```

### Play

**Computer 1 (Host):**
- Start both servers
- Open: `http://localhost:5173/dots`
- You are Player 1 (Blue)

**Computer 2 (Friend):**
- Open: `http://[HOST_IP]:5173/dots`
- Example: `http://192.168.1.100:5173/dots`
- You are Player 2 (Red)

## 🔧 Troubleshooting

### "Connecting to game..." stuck?
- ✅ Check backend is running on port 5000
- ✅ Check frontend is running on port 5173
- ✅ Check browser console for errors (F12)

### "Not your turn" error?
- ✅ Wait for the other player to finish their turn
- ✅ Check the turn indicator at the top

### Second player not connecting?
- ✅ Make sure both windows are open
- ✅ Try refreshing both windows
- ✅ Check that both are using the same URL

### Playing on different computers not working?
- ✅ Both computers must be on same WiFi network
- ✅ Check firewall isn't blocking port 5000 or 5173
- ✅ Update SOCKET_URL in frontend code to host IP

## 📱 Mobile Testing

You can also test on mobile devices:

1. Find your computer's IP (e.g., 192.168.1.100)
2. On mobile browser, go to: `http://192.168.1.100:5173/dots`
3. Mobile becomes Player 2!

Note: Touch controls might need optimization for mobile.

## 🎮 Example Game Session

```
1. Player 1 (Blue) opens first tab
   → Sees: "You are Player 1 (blue)"
   → Sees: "Player 1's turn (Your turn!)"

2. Player 2 (Red) opens second tab
   → Sees: "You are Player 2 (red)"
   → Sees: "Player 1's turn" (waiting)

3. Player 1 draws a line
   → Turn switches to Player 2

4. Player 2 draws a line
   → Turn switches to Player 1

5. Player 1 completes a box!
   → Scores 1 point
   → Gets another turn (bonus)

6. Continue until all boxes filled

7. Winner announced!
   → Click "Play again" to reset
```

## 🔄 Creating Private Rooms

Want to play with specific friends? Change the room ID:

Edit `engine-frontend/src/games/join-the-dots/JoinTheDots.tsx`:
```typescript
// Change this line:
const [roomId] = useState("dots_room_1");

// To your custom room:
const [roomId] = useState("my_private_room_123");
```

Now only players with the same room ID will play together!

## 📊 Testing Checklist

- [ ] Backend server running (port 5000)
- [ ] Frontend server running (port 5173)
- [ ] Two browser windows/tabs open
- [ ] Both showing the game board
- [ ] Player 1 sees "You are Player 1 (blue)"
- [ ] Player 2 sees "You are Player 2 (red)"
- [ ] Player 1 can move when it's their turn
- [ ] Player 2 can move when it's their turn
- [ ] Scores update in real-time
- [ ] Game over shows winner

## 🎉 You're Ready!

Just open two browser windows and start playing!

**Quick Commands:**
```bash
# Start everything
cd engine-backend && npm run dev
cd engine-frontend && npm run dev

# Open in browser
http://localhost:5173/dots (Tab 1 - Player 1)
http://localhost:5173/dots (Tab 2 - Player 2)
```

Have fun! 🎮
