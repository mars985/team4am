# 🎮 Quick Start - Strands Game

## Step 1: Start Backend Server

Open a terminal and run:
```bash
cd engine-backend
npm run dev
```

You should see: "Server running on port 5000"

## Step 2: Start Frontend

Open another terminal and run:
```bash
cd engine-frontend
npm run dev
```

You should see the Vite dev server URL (usually http://localhost:5173)

## Step 3: Play the Game

Open your browser and go to:
```
http://localhost:5173/strands
```

## How to Play

1. **Drag to Spell**: Click and drag across letters to form words
2. **Minimum 3 Letters**: Words must be at least 3 letters long
3. **Valid Words Only**: The dictionary will check if your word is valid
4. **Score Points**: Get 10 points per letter in valid words
5. **New Letters**: Click the "new" button to get a fresh set of letters

## Features

✅ Real-time word validation
✅ Dynamic letter generation
✅ Score tracking
✅ Word history
✅ Multiplayer ready (same room = same board)

## Troubleshooting

**Backend won't start?**
- Make sure you're in the `engine-backend` folder
- Run `npm install` first

**Frontend won't start?**
- Make sure you're in the `engine-frontend` folder
- Run `npm install` first

**Can't connect to game?**
- Make sure backend is running on port 5000
- Check browser console for errors
- Verify Socket.IO connection in Network tab

**Words not validating?**
- Check backend console for errors
- The dictionary uses real Dictionary API (https://dictionaryapi.dev)
- Try simple words like: CAR, BAT, RACE, CART, REACT
- API calls are cached for performance

## Dictionary API

The game uses the free Dictionary API:
- URL: `https://api.dictionaryapi.dev/api/v2/entries/en/<word>`
- Real English dictionary validation
- Results are cached to avoid repeated API calls
- No API key required (free service)
