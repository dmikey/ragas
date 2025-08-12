const RagasJS = require('./lib/ragas');

// Main class export
module.exports = RagasJS;

// Named exports for convenience
module.exports.RagasJS = RagasJS;

// Metric types constants for easy reference
module.exports.MetricTypes = {
    ASPECT_CRITIC: 'AspectCritic',
    ANSWER_CORRECTNESS: 'AnswerCorrectness',
    ANSWER_RELEVANCY: 'AnswerRelevancy',
    CONTEXT_PRECISION: 'ContextPrecision',
    CONTEXT_RECALL: 'ContextRecall',
    FAITHFULNESS: 'Faithfulness',
    BLEU_SCORE: 'BleuScore'
};

// Helper functions for creating common configurations
module.exports.createOpenAIConfig = (apiKey, model = 'gpt-4o-mini') => ({
    model,
    kwargs: {
        api_key: apiKey
    }
});

module.exports.createAspectCritic = (name, definition, llmConfig) => ({
    type: 'AspectCritic',
    name,
    definition,
    llm: llmConfig
});

module.exports.createAnswerCorrectness = (llmConfig) => ({
    type: 'AnswerCorrectness',
    llm: llmConfig
});

// Usage example in comments
/*
const RagasJS = require('ragas-js');

async function example() {
  const ragas = new RagasJS();
  
  // Check setup
  const isReady = await ragas.checkSetup();
  if (!isReady) {
    throw new Error('Ragas setup failed');
  }
  
  // Configure LLM
  const llmConfig = RagasJS.createOpenAIConfig(process.env.OPENAI_API_KEY);
  
  // Create metric
  const metric = RagasJS.createAspectCritic(
    'accuracy',
    'Is the response factually accurate?',
    llmConfig
  );
  
  // Evaluate
  const sample = {
    user_input: 'What is the capital of France?',
    response: 'The capital of France is Paris.',
    reference: 'Paris is the capital city of France.'
  };
  
  const score = await ragas.evaluateSingleTurn(sample, metric);
  console.log('Score:', score);
}
*/
