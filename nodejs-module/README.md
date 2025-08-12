# ragas-js

A Node.js wrapper for the [Ragas](https://github.com/explodinggradients/ragas) Python library, enabling LLM application evaluation directly from JavaScript/TypeScript.

## Installation

```bash
npm install ragas-js
```

**Prerequisites:**
- Python 3.9+ 
- pip package manager

The package will automatically install required Python dependencies during `npm install`.

## Quick Start

```javascript
const RagasJS = require('ragas-js');

async function evaluateResponse() {
  const ragas = new RagasJS();
  
  // Check if setup is correct
  const setupResult = await ragas.checkSetup();
  console.log('Setup status:', setupResult);
  
  if (setupResult.status === 'error') {
    throw new Error(`Setup failed: ${setupResult.message}`);
  }
  
  // Your test sample
  const sample = {
    question: 'What is the capital of France?',
    answer: 'The capital of France is Paris.',
    contexts: ['France is a country in Europe. Its capital city is Paris.']
  };
  
  // Evaluate different metrics
  const relevancyScore = await ragas.evaluateAnswerRelevancy(sample);
  console.log('Answer Relevancy Score:', relevancyScore);
  
  const faithfulnessScore = await ragas.evaluateFaithfulness(sample);
  console.log('Faithfulness Score:', faithfulnessScore);
  
  const contextScore = await ragas.evaluateContextPrecision(sample);
  console.log('Context Precision Score:', contextScore);
  
  // Custom aspect evaluation
  const aspectScore = await ragas.evaluateAspect(sample, {
    name: 'accuracy',
    definition: 'Is the response factually accurate and complete?'
  });
  console.log('Accuracy Score:', aspectScore);
}

// Make sure to set OPENAI_API_KEY environment variable
evaluateResponse().catch(console.error);
```

## API Reference

### Constructor

```javascript
const ragas = new RagasJS(options);
```

**Options:**
- `timeout`: Timeout in milliseconds (default: 30000)

### Methods

#### `checkSetup()`

Verifies that Python and Ragas dependencies are properly installed.

```javascript
const setupResult = await ragas.checkSetup();
// Returns: { status: 'ok'|'warning'|'error', message: 'description' }
```

#### `evaluateAnswerRelevancy(sample)`

Evaluates if the answer is relevant to the question.

```javascript
const score = await ragas.evaluateAnswerRelevancy({
  question: 'What is the capital of France?',
  answer: 'Paris is the capital of France.'
});
// Returns: 1.0 (relevant) or 0.0 (irrelevant)
```

#### `evaluateFaithfulness(sample)`

Evaluates if the answer is faithful to the provided context.

```javascript
const score = await ragas.evaluateFaithfulness({
  answer: 'Paris is the capital of France.',
  contexts: ['France is a country in Europe. Its capital city is Paris.']
});
// Returns: 1.0 (faithful) or 0.0 (unfaithful)
```

#### `evaluateContextPrecision(sample)`

Evaluates if the retrieved context is precise and relevant.

```javascript
const score = await ragas.evaluateContextPrecision({
  question: 'What is the capital of France?',
  contexts: ['France is a country in Europe. Its capital city is Paris.']
});
// Returns: 1.0 (precise) or 0.0 (imprecise)
```

#### `evaluateAspect(sample, config)`

Evaluates using custom aspect criteria.

```javascript
const score = await ragas.evaluateAspect(
  {
    question: 'What is machine learning?',
    answer: 'Machine learning is a subset of AI...'
  },
  {
    name: 'clarity',
    definition: 'Is the explanation clear and easy to understand?'
  }
);
// Returns: 1.0 (good) or 0.0 (poor)
```

#### `batchEvaluate(samples, metrics)`

Evaluates multiple samples with multiple metrics.

```javascript
const results = await ragas.batchEvaluate(
  [
    { question: 'Q1?', answer: 'A1', contexts: ['C1'] },
    { question: 'Q2?', answer: 'A2', contexts: ['C2'] }
  ],
  ['answer_relevancy', 'faithfulness']
);
// Returns: Array of score objects for each sample
```

## Advanced Usage

### Evaluating Multiple Samples

```javascript
const samples = [
  {
    question: 'What is the capital of France?',
    answer: 'Paris is the capital of France.',
    contexts: ['France is a country in Europe. Its capital city is Paris.']
  },
  {
    question: 'What is machine learning?',
    answer: 'Machine learning is a subset of AI that learns from data.',
    contexts: ['Machine learning is a branch of AI that uses algorithms...']
  }
];

const metrics = ['answer_relevancy', 'faithfulness', 'context_precision'];

const results = await ragas.batchEvaluate(samples, metrics);
console.log(results);
// Returns array of evaluation results for each sample
```

### RAG System Evaluation

```javascript
// For RAG systems, include retrieved contexts
const ragSample = {
  question: 'What is machine learning?',
  answer: 'Machine learning is an AI technique that learns from data...',
  contexts: [
    'Machine learning is a subset of AI...',
    'ML algorithms learn from data patterns...'
  ]
};

// Evaluate all RAG-specific metrics
const relevancyScore = await ragas.evaluateAnswerRelevancy(ragSample);
const faithfulnessScore = await ragas.evaluateFaithfulness(ragSample);
const contextScore = await ragas.evaluateContextPrecision(ragSample);

console.log({
  answer_relevancy: relevancyScore,
  faithfulness: faithfulnessScore,
  context_precision: contextScore
});
```

### Custom Aspect Evaluation

```javascript
// Define custom evaluation criteria
const customAspects = [
  {
    name: 'technical_accuracy',
    definition: 'Is the technical information accurate and up-to-date?'
  },
  {
    name: 'completeness',
    definition: 'Does the answer provide comprehensive coverage of the topic?'
  },
  {
    name: 'clarity',
    definition: 'Is the explanation clear and easy to understand?'
  }
];

const sample = {
  question: 'Explain how neural networks work',
  answer: 'Neural networks are computational models inspired by biological neurons...'
};

for (const aspect of customAspects) {
  const score = await ragas.evaluateAspect(sample, aspect);
  console.log(`${aspect.name}: ${score}`);
}
```

## Error Handling

```javascript
try {
  const score = await ragas.evaluateAnswerRelevancy(sample);
  console.log('Score:', score);
} catch (error) {
  if (error.message.includes('Python process failed')) {
    console.error('Python execution error:', error.message);
    // Check if OPENAI_API_KEY is set
    // Check if Python dependencies are installed
  } else if (error.message.includes('timed out')) {
    console.error('Evaluation took too long');
    // Consider increasing timeout or reducing sample size
  } else if (error.message.includes('LLM')) {
    console.error('LLM configuration error:', error.message);
    // Check API key and model availability
  } else {
    console.error('Unexpected error:', error.message);
  }
}
```

## Environment Variables

Set these environment variables for your LLM provider:

```bash
export OPENAI_API_KEY="your-openai-key"
```

## Troubleshooting

### Python Dependencies

If automatic installation fails:

```bash
# Install Python dependencies manually
cd /Users/derekanderson/Projects/explodinggradients/ragas/experimental
pip install -e .
pip install openai
```

### API Key Issues

Make sure your OpenAI API key is valid and has sufficient credits:

```javascript
// Test API key validity
const setupResult = await ragas.checkSetup();
console.log(setupResult);
```

### Performance Issues

For large evaluations, consider processing in smaller batches:

```javascript
// Process samples in chunks
const chunkSize = 5;
const results = [];

for (let i = 0; i < samples.length; i += chunkSize) {
  const chunk = samples.slice(i, i + chunkSize);
  const chunkResults = await ragas.batchEvaluate(chunk, ['answer_relevancy']);
  results.push(...chunkResults);
  
  // Optional: add delay between batches
  await new Promise(resolve => setTimeout(resolve, 1000));
}
```

## Contributing

This is a wrapper around the Python Ragas library. For core functionality issues, please refer to the [main Ragas repository](https://github.com/explodinggradients/ragas).

## License

MIT

## Links

- [Ragas Documentation](https://docs.ragas.io/)
- [Ragas GitHub](https://github.com/explodinggradients/ragas)
- [Report Issues](https://github.com/your-org/ragas-js/issues)
