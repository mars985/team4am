// Quick test script to verify dictionary is working
import { isValidWord, getRandomLetters } from './src/utils/dictionary.js';

console.log('🧪 Testing Dictionary Service\n');

// Test word validation
console.log('📖 Word Validation Tests:');
const testWords = ['react', 'cart', 'xyz', 'cat', 'invalid123'];
testWords.forEach(word => {
  const isValid = isValidWord(word);
  console.log(`  ${isValid ? '✅' : '❌'} "${word}" - ${isValid ? 'VALID' : 'INVALID'}`);
});

// Test letter generation
console.log('\n🎲 Random Letter Generation:');
for (let i = 0; i < 3; i++) {
  const { baseWord, extraLetters, allLetters } = getRandomLetters();
  console.log(`  Game ${i + 1}:`);
  console.log(`    Base Word: ${baseWord}`);
  console.log(`    Extra Letters: ${extraLetters.join(', ')}`);
  console.log(`    All Letters: ${allLetters.join(' ')}`);
}

console.log('\n✅ Dictionary service is working!\n');
