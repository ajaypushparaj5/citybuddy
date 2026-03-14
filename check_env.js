import fs from 'fs';
import path from 'path';

// Helper to parse .env file
function loadEnv() {
  const envPath = path.resolve('.env');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const env = {};
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      env[match[1]] = match[2].trim();
    }
  });
  return env;
}

const env = loadEnv();
const results = [];

function addResult(line) {
  console.log(line);
  results.push(line);
}

addResult('--- Checking API Keys and Endpoints ---');

async function checkUrl(name, url, options = {}) {
  try {
    const res = await fetch(url, options);
    if (res.ok) {
      addResult(`✅ ${name}: WORKING (${res.status})`);
    } else {
      addResult(`❌ ${name}: FAILED with status ${res.status}`);
      const text = await res.text();
      addResult(`   Response: ${text.substring(0, 50)}...`);
    }
  } catch (err) {
    addResult(`❌ ${name}: ERROR - ${err.message}`);
  }
}

async function runTests() {
  // 1. Overpass API
  if (env.VITE_OSM_OVERPASS_API_URL) {
    await checkUrl(
      'VITE_OSM_OVERPASS_API_URL', 
      `${env.VITE_OSM_OVERPASS_API_URL}?data=[out:json];node(1);out;`
    );
  } else {
    console.log('⚠️ VITE_OSM_OVERPASS_API_URL is missing');
  }

  // 2. Supabase
  if (env.VITE_SUPABASE_URL && env.VITE_SUPABASE_ANON_KEY) {
    await checkUrl(
      'VITE_SUPABASE_URL', 
      `${env.VITE_SUPABASE_URL}/rest/v1/`, 
      {
        headers: {
          'apikey': env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${env.VITE_SUPABASE_ANON_KEY}`
        }
      }
    );
  } else {
    console.log('⚠️ Supabase credentials missing');
  }

  // 3. OpenWeatherMap
  if (env.VITE_WEATHER_API_KEY) {
    await checkUrl(
      'VITE_WEATHER_API_KEY (OpenWeatherMap)', 
      `https://api.openweathermap.org/data/2.5/weather?q=London&appid=${env.VITE_WEATHER_API_KEY}`
    );
  } else {
    console.log('⚠️ VITE_WEATHER_API_KEY missing');
  }

  // 4. Traffic API (TomTom)
  if (env.VITE_TRAFFIC_API_KEY) {
    await checkUrl(
      'VITE_TRAFFIC_API_KEY (TomTom Traffic)', 
      `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?key=${env.VITE_TRAFFIC_API_KEY}&point=52.41072,4.84239`
    );
  } else {
    console.log('⚠️ VITE_TRAFFIC_API_KEY missing');
  }

  // 5. News API (NewsAPI.org)
  if (env.VITE_NEWS_API_KEY) {
    await checkUrl(
      'VITE_NEWS_API_KEY (NewsAPI.org)', 
      `https://newsapi.org/v2/top-headlines?country=us&apiKey=${env.VITE_NEWS_API_KEY}`
    );
  } else {
    console.log('⚠️ VITE_NEWS_API_KEY missing');
  }

  // 6. Gemini AI
  if (env.VITE_AI_LLM_API_KEY) {
    await checkUrl(
      'VITE_AI_LLM_API_KEY (Gemini)', 
      `https://generativelanguage.googleapis.com/v1beta/models?key=${env.VITE_AI_LLM_API_KEY}`
    );
  } else {
    console.log('⚠️ VITE_AI_LLM_API_KEY missing');
  }

  addResult('--- Finished checking API Keys ---');
  fs.writeFileSync('env_results.txt', results.join('\n'));
}

runTests();
