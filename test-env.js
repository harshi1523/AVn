import { loadEnv } from 'vite';
const env = loadEnv('development', '.', '');
console.log('API_KEY:', env.API_KEY);
console.log('GEMINI_API_KEY:', env.GEMINI_API_KEY);
console.log('JSON.stringify(env.GEMINI_API_KEY):', JSON.stringify(env.GEMINI_API_KEY));
