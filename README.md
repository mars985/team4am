# Team4AM - Multiplayer Game Platform

## Strands Game Setup

### Backend Setup

1. Install dependencies:
```bash
cd engine-backend
npm install
```

2. Start the backend server:
```bash
npm run dev
```

Server will run on `http://localhost:5000`

### Frontend Setup

1. Install dependencies:
```bash
cd engine-frontend
npm install
```

2. Start the frontend:
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

### Playing Strands Game

1. Open browser and go to: `http://localhost:5173/strands`
2. Drag across letters to form words (minimum 3 letters)
3. Valid words will be checked against the dictionary
4. Score increases based on word length (10 points per letter)
5. Click "new" button to get a fresh set of letters

### Features

- **Real-time validation**: Words are validated against a dictionary on the server
- **Dynamic letter generation**: New random letters generated each game
- **Score tracking**: Points awarded for valid words
- **Word history**: See all words you've found
- **Multiplayer ready**: Multiple players can join the same room

### How It Works

1. Frontend connects to backend via Socket.IO
2. Player joins a game room
3. Backend generates random letters from a base word + extras
4. Player drags to form words
5. Backend validates word against dictionary
6. Score updates in real-time
7. All players in the room see the same board

### Game Rules

- Minimum 3 letters per word
- Each letter can only be used once per word
- Words must be valid English words
- 10 points per letter
- Words cannot be repeated
