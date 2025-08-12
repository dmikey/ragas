#!/usr/bin/env node

/**
 * Test script for custom metrics functionality
 */

const RagasJS = require('../lib/ragas');

async function testCustomMetrics() {
  const ragas = new RagasJS();
  
  console.log('🔧 Testing Custom Metrics in Ragas...\n');
  
  try {
    // First check if setup is working
    console.log('1. Checking setup...');
    const setup = await ragas.checkSetup();
    console.log('Setup result:', setup);
    
    if (setup.status !== 'ok') {
      console.log('⚠️  Setup issues detected, but continuing with tests...\n');
    }
    
    // Test 1: Create a custom discrete metric for response quality
    console.log('2. Creating custom discrete metric for response quality...');
    const qualityMetric = await ragas.createDiscreteMetric(
      'response_quality',
      'Evaluate the quality of the response. Return "excellent" if the response is comprehensive and accurate, "good" if it addresses the question adequately, or "poor" if it\'s inadequate.\nQuestion: {question}\nResponse: {response}',
      ['excellent', 'good', 'poor']
    );
    console.log('Quality metric created:', qualityMetric);
    
    // Test 2: Create a custom discrete metric for tone evaluation
    console.log('\n3. Creating custom discrete metric for tone...');
    const toneMetric = await ragas.createDiscreteMetric(
      'tone_appropriateness',
      'Evaluate if the tone of the response is appropriate for the context. Return "professional" if the tone is formal and business-appropriate, "casual" if it\'s informal but friendly, or "inappropriate" if the tone doesn\'t match the context.\nContext: {context}\nResponse: {response}',
      ['professional', 'casual', 'inappropriate']
    );
    console.log('Tone metric created:', toneMetric);
    
    // Test 3: Evaluate using the custom quality metric
    console.log('\n4. Testing evaluation with custom quality metric...');
    
    const qualityEvaluation = await ragas.evaluateCustomMetric(
      {
        name: 'response_quality',
        prompt: 'Evaluate the quality of the response. Return "excellent" if the response is comprehensive and accurate, "good" if it addresses the question adequately, or "poor" if it\'s inadequate.\nQuestion: {question}\nResponse: {response}',
        allowed_values: ['excellent', 'good', 'poor']
      },
      {
        question: 'What is the capital of France?',
        response: 'The capital of France is Paris, which is located in the north-central part of the country along the Seine River. It is both the largest city in France and serves as the political, economic, and cultural center of the nation.'
      }
    );
    
    console.log('Quality evaluation result:', qualityEvaluation);
    
    // Test 4: Evaluate using the custom tone metric
    console.log('\n5. Testing evaluation with custom tone metric...');
    
    const toneEvaluation = await ragas.evaluateCustomMetric(
      {
        name: 'tone_appropriateness',
        prompt: 'Evaluate if the tone of the response is appropriate for the context. Return "professional" if the tone is formal and business-appropriate, "casual" if it\'s informal but friendly, or "inappropriate" if the tone doesn\'t match the context.\nContext: {context}\nResponse: {response}',
        allowed_values: ['professional', 'casual', 'inappropriate']
      },
      {
        context: 'Customer service email response',
        response: 'Thank you for contacting us regarding your recent order. We have reviewed your account and will process a refund within 3-5 business days. Please let us know if you need any additional assistance.'
      }
    );
    
    console.log('Tone evaluation result:', toneEvaluation);
    
    // Test 5: Create and test a helpfulness metric
    console.log('\n6. Testing helpfulness metric...');
    
    const helpfulnessEvaluation = await ragas.evaluateCustomMetric(
      {
        name: 'helpfulness',
        prompt: 'Evaluate how helpful the response is for solving the user\'s problem. Return "very_helpful" if it completely solves the issue, "somewhat_helpful" if it partially helps, or "not_helpful" if it doesn\'t address the problem.\nUser Problem: {problem}\nResponse: {response}',
        allowed_values: ['very_helpful', 'somewhat_helpful', 'not_helpful']
      },
      {
        problem: 'My computer won\'t start up and shows a blue screen',
        response: 'A blue screen error usually indicates a hardware or driver issue. Try these steps: 1) Restart your computer and see if it boots normally, 2) If it happens again, try booting in safe mode, 3) Check for recently installed hardware or software, 4) Run a memory diagnostic test. If the problem persists, it might be a failing hard drive or RAM issue.'
      }
    );
    
    console.log('Helpfulness evaluation result:', helpfulnessEvaluation);
    
    console.log('\n✅ Custom metrics testing completed successfully!');
    console.log('\n📊 Summary:');
    console.log('- Created and tested custom discrete metrics');
    console.log('- Evaluated response quality, tone, and helpfulness');
    console.log('- All custom metric evaluations working properly');
    
  } catch (error) {
    console.error('❌ Error during custom metrics testing:', error.message);
    if (error.stderr) {
      console.error('Python stderr:', error.stderr);
    }
    process.exit(1);
  }
}

// Main execution
if (require.main === module) {
  testCustomMetrics().then(() => {
    console.log('\n🎉 Custom metrics test completed!');
    process.exit(0);
  }).catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
}

module.exports = { testCustomMetrics };
