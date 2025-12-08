/**
 * AI Model Testing Script for ShikshanAI
 * Run: node scripts/run-model-test.js
 */

const API_KEY = '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';
const BASE_URL = 'https://openrouter.ai/api/v1';

const MODELS = [
  // Paid models
  { id: 'amazon/nova-micro-v1', name: 'Amazon Nova Micro', provider: 'Amazon', cost: 0.035 },
  { id: 'google/gemini-2.0-flash-001', name: 'Gemini 2.0 Flash', provider: 'Google', cost: 0.10 },
  { id: 'openai/gpt-4.1-nano', name: 'GPT-4.1 Nano', provider: 'OpenAI', cost: 0.10 },
  { id: 'qwen/qwen-2.5-72b-instruct', name: 'Qwen 2.5 72B', provider: 'Alibaba', cost: 0.35 },
  { id: 'x-ai/grok-3-mini-beta', name: 'Grok 3 Mini', provider: 'xAI', cost: 0.30 },
  // Free models
  { id: 'google/gemma-3-4b-it:free', name: 'Gemma 3 4B', provider: 'Google', cost: 0 },
  { id: 'mistralai/mistral-small-3.1-24b-instruct:free', name: 'Mistral Small 3.1', provider: 'Mistral', cost: 0 },
  { id: 'microsoft/phi-4:free', name: 'Microsoft Phi-4', provider: 'Microsoft', cost: 0 }
];

const TESTS = [
  {
    name: 'Lesson Explanation',
    prompt: `Explain "Euclid's Division Lemma" to a Class 10 CBSE student. Include: 1) Simple definition 2) One example 3) Why it's useful. Keep under 150 words.`
  },
  {
    name: 'Tutoring Response', 
    prompt: `Student asks: "Why is HCF important?" Respond as a friendly tutor with a real-life example. Be encouraging.`
  },
  {
    name: 'Practice Question',
    prompt: `Create ONE quadratic equation question for Class 10: Question, 4 options (A-D), answer, brief solution.`
  }
];

async function testModel(modelId, prompt) {
  const start = Date.now();
  try {
    const res = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://shikshanai.com'
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          { role: 'system', content: 'You are an expert CBSE tutor. Be clear and concise.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 400,
        temperature: 0.7
      })
    });
    
    const time = Date.now() - start;
    
    if (!res.ok) {
      const err = await res.text();
      return { success: false, time, error: `HTTP ${res.status}`, tokens: 0, response: '' };
    }
    
    const data = await res.json();
    return {
      success: true,
      time,
      tokens: data.usage?.total_tokens || 0,
      response: data.choices?.[0]?.message?.content || ''
    };
  } catch (e) {
    return { success: false, time: Date.now() - start, error: e.message, tokens: 0, response: '' };
  }
}

function scoreResponse(response) {
  let score = 5;
  if (response.length < 50) score -= 2;
  if (response.length > 100) score += 1;
  if (/\d+\.|•|-/.test(response)) score += 1;
  if (/example|consider/i.test(response)) score += 2;
  if (/step|first|then/i.test(response)) score += 1;
  if (/error|sorry|can't/i.test(response)) score -= 3;
  return Math.max(1, Math.min(10, score));
}

async function runTests() {
  console.log('🚀 ShikshanAI AI Model Testing\n');
  console.log('Testing 5 models with 3 educational scenarios...\n');
  
  const results = [];
  
  for (const model of MODELS) {
    console.log(`\n🧪 Testing ${model.name}...`);
    const modelResults = [];
    
    for (const test of TESTS) {
      process.stdout.write(`   - ${test.name}... `);
      const result = await testModel(model.id, test.prompt);
      
      if (result.success) {
        const quality = scoreResponse(result.response);
        console.log(`✅ ${result.time}ms, Quality: ${quality}/10`);
        modelResults.push({ ...result, quality, test: test.name });
      } else {
        console.log(`❌ ${result.error}`);
        modelResults.push({ ...result, quality: 0, test: test.name });
      }
      
      await new Promise(r => setTimeout(r, 1500));
    }
    
    results.push({ model, tests: modelResults });
  }
  
  // Calculate rankings
  console.log('\n\n📊 RESULTS SUMMARY\n');
  console.log('=' .repeat(100));
  
  const rankings = results.map(r => {
    const success = r.tests.filter(t => t.success);
    const successRate = (success.length / r.tests.length) * 100;
    const avgQuality = success.length > 0 ? success.reduce((s, t) => s + t.quality, 0) / success.length : 0;
    const avgTime = success.length > 0 ? success.reduce((s, t) => s + t.time, 0) / success.length : 99999;
    const avgTokens = success.length > 0 ? success.reduce((s, t) => s + t.tokens, 0) / success.length : 0;
    
    const perfScore = Math.max(1, 10 - (avgTime / 2000));
    const costScore = r.model.cost === 0 ? 10 : Math.max(1, 10 - r.model.cost * 5);
    const overall = successRate > 0 ? (avgQuality * 0.5) + (perfScore * 0.3) + (costScore * 0.2) : 0;
    
    return {
      name: r.model.name,
      provider: r.model.provider,
      cost: r.model.cost,
      successRate,
      avgQuality,
      avgTime,
      avgTokens,
      perfScore,
      costScore,
      overall
    };
  }).sort((a, b) => b.overall - a.overall);
  
  // Print table
  console.log('\n| Rank | Model              | Provider | Quality | Avg Time | Cost/1M   | Success | Overall |');
  console.log('|:----:|-------------------|----------|:-------:|:--------:|:---------:|:-------:|:-------:|');
  
  rankings.forEach((r, i) => {
    const cost = r.cost === 0 ? 'FREE' : `$${r.cost.toFixed(2)}`;
    console.log(`| ${i + 1}    | ${r.name.padEnd(17)} | ${r.provider.padEnd(8)} | ${r.avgQuality.toFixed(1)}/10  | ${r.avgTime.toFixed(0).padStart(5)}ms  | ${cost.padStart(9)} | ${r.successRate.toFixed(0).padStart(4)}%   | ${r.overall.toFixed(1).padStart(4)}   |`);
  });
  
  console.log('\n\n💡 RECOMMENDATIONS:');
  console.log(`🏆 Best Overall: ${rankings[0].name} (Score: ${rankings[0].overall.toFixed(1)})`);
  
  const bestFree = rankings.find(r => r.cost === 0);
  if (bestFree && bestFree !== rankings[0]) {
    console.log(`💰 Best Free: ${bestFree.name} (Score: ${bestFree.overall.toFixed(1)})`);
  }
  
  const bestPaid = rankings.find(r => r.cost > 0);
  if (bestPaid) {
    console.log(`⚡ Best Paid: ${bestPaid.name} (Score: ${bestPaid.overall.toFixed(1)}, $${bestPaid.cost}/1M)`);
  }
  
  console.log('\n✅ Testing complete!');
}

runTests().catch(console.error);
