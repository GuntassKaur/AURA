const fs = require('fs');

// Simple dependency-free .env parser
function getEnvKeys() {
    if (!fs.existsSync('.env')) return {};
    const content = fs.readFileSync('.env', 'utf8');
    const lines = content.split('\n');
    const keys = {};
    lines.forEach(line => {
        const match = line.match(/^\s*(\w+)\s*=\s*(.*)\s*$/);
        if (match) {
            keys[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, '');
        }
    });
    return keys;
}

const keys = getEnvKeys();
const geminiKey = keys.GEMINI_API_KEY || '';
const weatherKey = keys.WEATHER_API_KEY || '';

if (fs.existsSync('aura_v2.js')) {
    let content = fs.readFileSync('aura_v2.js', 'utf8');
    content = content.replace(/GEMINI_API_KEY: '.*'/, `GEMINI_API_KEY: '${geminiKey}'`);
    content = content.replace(/WEATHER_API_KEY: '.*'/, `WEATHER_API_KEY: '${weatherKey}'`);
    fs.writeFileSync('aura_v2.js', content);
    console.log('✅ AURA v2.0 Tactical Engine Updated!');
    console.log(`   - Gemini AI: ${geminiKey ? 'CONNECTED' : 'MISSING'}`);
    console.log(`   - Weather: ${weatherKey ? 'CONNECTED' : 'MISSING'}`);
} else {
    console.error('❌ aura_v2.js not found!');
}
