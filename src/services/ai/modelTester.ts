/**
 * AI Model Testing Suite for ShikshanAI
 * Tests different OpenRouter models for educational content generation
 */

interface ModelConfig {
  id: string;
  name: string;
  provider: string;
  costPer1MTokens: number; // USD per million tokens
}

interface TestResult {
  modelId: string;
  modelName: string;
  testName: string;
  response: string;
  responseTime: number;
  tokenCount: number;
  qualityScore: number;
  educationalValue: number;
  clarity: number;
  success: boolean;
  error?: string;
}

const MODELS: ModelConfig[] = [
  {
    id: 'amazon/nova-lite-v1:free',
    name: 'Amazon Nova Lite',
    provider: 'Amazon',
    costPer1MTokens: 0.0
  },
  {
    id: 'google/gemini-2.5-flash-preview-05-20',
    name: 'Gemini 2.5 Flash',
    provider: 'Google',
    costPer1MTokens: 0.15
  },
  {
    id: 'openai/gpt-4.1-nano',
    name: 'GPT-4.1 Nano',
    provider: 'OpenAI',
    costPer1MTokens: 0.10
  },
  {
    id: 'qwen/qwen3-30b-a3b:free',
    name: 'Qwen 3 30B',
    provider: 'Alibaba',
    costPer1MTokens: 0.0
  },
  {
    id: 'x-ai/grok-3-mini-beta',
    name: 'Grok 3 Mini',
    provider: 'xAI',
    costPer1MTokens: 0.30
  }
];

const TEST_PROMPTS = [
  {
    name: 'Lesson Explanation',
    prompt: `Explain "Euclid's Division Lemma" to a Class 10 CBSE student in simple terms. Include:
1. What it means in plain language
2. One clear example
3. Why it's useful
Keep it under 200 words.`
  },
  {
    name: 'Tutoring Response',
    prompt: `A student asks: "I don't understand why HCF is important. Can you explain with a real example?"
Respond as a friendly tutor. Be encouraging and use a relatable example.`
  },
  {
    name: 'Practice Question',
    prompt: `Create ONE practice question on Quadratic Equations for Class 10 CBSE:
- Medium difficulty
- Include the question, 4 options (A-D), correct answer, and brief solution
Format clearly.`
  }
];

export class ModelTester {
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async testModel(modelId: string, prompt: string): Promise<{
    response: string;
    responseTime: number;
    tokenCount: number;
    success: boolean;
    error?: string;
  }> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://shikshanai.com',
          'X-Title': 'ShikshanAI Model Testing'
        },
        body: JSON.stringify({
          model: modelId,
          messages: [
            {
              role: 'system',
              content: 'You are an expert AI tutor for Indian CBSE curriculum. Be clear, concise, and student-friendly.'
            },
            { role: 'user', content: prompt }
          ],
          max_tokens: 500,
          temperature: 0.7
        })
      });

      const responseTime = Date.now() - startTime;

      if (!response.ok) {
        const errorText = await response.text();
        return {
          response: '',
          responseTime,
          tokenCount: 0,
          success: false,
          error: `HTTP ${response.status}: ${errorText.substring(0, 100)}`
        };
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';
      const tokenCount = data.usage?.total_tokens || 0;

      return { response: content, responseTime, tokenCount, success: true };
    } catch (error) {
      return {
        response: '',
        responseTime: Date.now() - startTime,
        tokenCount: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  evaluateResponse(response: string): { quality: number; educational: number; clarity: number } {
    let quality = 5, educational = 5, clarity = 5;

    // Length check
    if (response.length < 50) { quality -= 2; educational -= 2; }
    else if (response.length > 100) { quality += 1; educational += 1; }

    // Structure markers
    if (/\d+\.|•|-/.test(response)) { clarity += 1; quality += 1; }
    if (/example|for instance|consider/i.test(response)) { educational += 2; }
    if (/step|first|then|next/i.test(response)) { clarity += 1; }
    if (/CBSE|Class 10|NCERT/i.test(response)) { educational += 1; }
    if (/\*\*|##/.test(response)) { clarity += 1; }

    // Negative markers
    if (/error|sorry|can't|unable/i.test(response)) { quality -= 3; }

    return {
      quality: Math.max(1, Math.min(10, quality)),
      educational: Math.max(1, Math.min(10, educational)),
      clarity: Math.max(1, Math.min(10, clarity))
    };
  }

  async runAllTests(): Promise<TestResult[]> {
    const results: TestResult[] = [];

    for (const model of MODELS) {
      console.log(`\n🧪 Testing ${model.name}...`);
      
      for (const test of TEST_PROMPTS) {
        console.log(`   - ${test.name}`);
        
        const result = await this.testModel(model.id, test.prompt);
        const scores = result.success ? this.evaluateResponse(result.response) : { quality: 0, educational: 0, clarity: 0 };

        results.push({
          modelId: model.id,
          modelName: model.name,
          testName: test.name,
          response: result.response,
          responseTime: result.responseTime,
          tokenCount: result.tokenCount,
          qualityScore: scores.quality,
          educationalValue: scores.educational,
          clarity: scores.clarity,
          success: result.success,
          error: result.error
        });

        // Rate limiting delay
        await new Promise(r => setTimeout(r, 1500));
      }
    }

    return results;
  }

  generateReport(results: TestResult[]): string {
    // Group by model
    const modelGroups: Record<string, TestResult[]> = {};
    for (const r of results) {
      if (!modelGroups[r.modelId]) modelGroups[r.modelId] = [];
      modelGroups[r.modelId].push(r);
    }

    // Calculate rankings
    const rankings = Object.entries(modelGroups).map(([modelId, tests]) => {
      const model = MODELS.find(m => m.id === modelId)!;
      const successTests = tests.filter(t => t.success);
      const successRate = (successTests.length / tests.length) * 100;
      
      const avgQuality = successTests.length > 0 
        ? successTests.reduce((s, t) => s + t.qualityScore, 0) / successTests.length : 0;
      const avgEducational = successTests.length > 0
        ? successTests.reduce((s, t) => s + t.educationalValue, 0) / successTests.length : 0;
      const avgClarity = successTests.length > 0
        ? successTests.reduce((s, t) => s + t.clarity, 0) / successTests.length : 0;
      const avgResponseTime = successTests.length > 0
        ? successTests.reduce((s, t) => s + t.responseTime, 0) / successTests.length : 0;
      const avgTokens = successTests.length > 0
        ? successTests.reduce((s, t) => s + t.tokenCount, 0) / successTests.length : 0;

      const overallQuality = (avgQuality + avgEducational + avgClarity) / 3;
      const performanceScore = Math.max(1, 10 - (avgResponseTime / 2000));
      const costScore = model.costPer1MTokens === 0 ? 10 : Math.max(1, 10 - model.costPer1MTokens * 5);
      
      const overallScore = successRate > 0 
        ? (overallQuality * 0.5) + (performanceScore * 0.3) + (costScore * 0.2)
        : 0;

      return {
        modelId,
        name: model.name,
        provider: model.provider,
        cost: model.costPer1MTokens,
        successRate,
        avgQuality: overallQuality,
        avgResponseTime,
        avgTokens,
        performanceScore,
        costScore,
        overallScore
      };
    }).sort((a, b) => b.overallScore - a.overallScore);

    // Generate markdown report
    let report = `# 🎯 ShikshanAI AI Model Evaluation Report
**Date:** ${new Date().toLocaleDateString()}
**Tests per model:** ${TEST_PROMPTS.length}

## 📊 Model Rankings

| Rank | Model | Provider | Quality | Performance | Cost/1M | Success | Overall |
|:----:|-------|----------|:-------:|:-----------:|:-------:|:-------:|:-------:|
`;

    rankings.forEach((r, i) => {
      const costStr = r.cost === 0 ? '**FREE**' : `$${r.cost.toFixed(2)}`;
      report += `| ${i + 1} | ${r.name} | ${r.provider} | ${r.avgQuality.toFixed(1)}/10 | ${r.avgResponseTime.toFixed(0)}ms | ${costStr} | ${r.successRate.toFixed(0)}% | **${r.overallScore.toFixed(1)}** |\n`;
    });

    report += `\n## 🔍 Detailed Results\n\n`;

    for (const r of rankings) {
      const tests = modelGroups[r.modelId];
      report += `### ${r.name} (${r.provider})\n`;
      report += `- **Overall Score:** ${r.overallScore.toFixed(1)}/10\n`;
      report += `- **Avg Response Time:** ${r.avgResponseTime.toFixed(0)}ms\n`;
      report += `- **Cost:** ${r.cost === 0 ? 'FREE' : `$${r.cost.toFixed(2)}/1M tokens`}\n`;
      report += `- **Success Rate:** ${r.successRate.toFixed(0)}%\n\n`;

      for (const t of tests) {
        const status = t.success ? '✅' : '❌';
        report += `**${status} ${t.testName}:** `;
        if (t.success) {
          report += `Quality: ${t.qualityScore}/10, Time: ${t.responseTime}ms\n`;
        } else {
          report += `Failed - ${t.error}\n`;
        }
      }
      report += '\n---\n\n';
    }

    // Recommendations
    const top = rankings[0];
    const bestFree = rankings.find(r => MODELS.find(m => m.id === r.modelId)?.costPer1MTokens === 0);
    
    report += `## 💡 Recommendations\n\n`;
    report += `**🏆 Best Overall:** ${top.name} (Score: ${top.overallScore.toFixed(1)})\n\n`;
    if (bestFree && bestFree !== top) {
      report += `**💰 Best Free Option:** ${bestFree.name} (Score: ${bestFree.overallScore.toFixed(1)})\n\n`;
    }

    return report;
  }
}

export async function runModelTests(apiKey: string): Promise<string> {
  const tester = new ModelTester(apiKey);
  console.log('🚀 Starting AI Model Testing for ShikshanAI...');
  const results = await tester.runAllTests();
  return tester.generateReport(results);
}
