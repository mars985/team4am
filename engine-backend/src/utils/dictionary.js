// Dictionary API service for word validation
const DICTIONARY_API_URL = "https://api.dictionaryapi.dev/api/v2/entries/en";

const wordCache = new Map();

export async function isValidWord(word) {
  const wordLower = word.toLowerCase();
  
  if (wordCache.has(wordLower)) {
    return wordCache.get(wordLower);
  }
  
  try {
    const response = await fetch(`${DICTIONARY_API_URL}/${wordLower}`);
    const isValid = response.ok;
    
    wordCache.set(wordLower, isValid);
    
    return isValid;
  } catch (error) {
    console.error(`Error validating word "${word}":`, error.message);
    return false;
  }
}

export function getRandomLetters() {
  const baseWords = [
    "REACT", "CASTLE", "BATTLE", "CREATE", "STABLE", "MASTER",
    "STREAM", "PLANET", "FOREST", "MARKET", "WINTER", "SPRING"
  ];
  
  const baseWord = baseWords[Math.floor(Math.random() * baseWords.length)];
  
  const extraLettersPool = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const extraLetters = [];
  
  const count = 3 + Math.floor(Math.random() * 3);
  for (let i = 0; i < count; i++) {
    extraLetters.push(
      extraLettersPool[Math.floor(Math.random() * extraLettersPool.length)]
    );
  }
  
  return {
    baseWord,
    extraLetters,
    allLetters: shuffle([...baseWord.split(""), ...extraLetters])
  };
}

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
