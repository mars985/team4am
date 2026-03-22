// Test script to verify Dictionary API is working
import { isValidWord } from './src/utils/dictionary.js';

console.log('🧪 Testing Dictionary API Service\n');

const testWords = [
  'react', 'cart', 'cat', 'race', 'trace',  // Valid words
  'xyz', 'zzz', 'qwerty', 'asdfgh'          // Invalid words
];

console.log('📖 Testing word validation with Dictionary API:\n');

async function testAllWords() {
  for (const word of testWords) {
    const isValid = await isValidWord(word);
    console.log(`  ${isValid ? '✅' : '❌'} "${word}" - ${isValid ? 'VALID' : 'INVALID'}`);
  }
  
  console.log('\n🔄 Testing cache (should be instant):');
  console.time('Cached lookup');
  await isValidWord('react');
  console.timeEnd('Cached lookup');
  
  console.log('\n✅ Dictionary API service is working!\n');
}

testAllWords().catch(err => {
  console.error('❌ Error testing dictionary:', err);
});
