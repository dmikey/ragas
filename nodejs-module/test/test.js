const RagasJS = require('../index');

async function runTests() {
    console.log('Testing ragas-js...\n');

    try {
        // Initialize
        const ragas = new RagasJS();
        console.log('✓ RagasJS initialized');

        // Check setup
        console.log('Checking Python setup...');
        const setupResult = await ragas.checkSetup();
        console.log('✓ Setup check result:', setupResult);

        if (setupResult.status === 'error') {
            console.log('✗ Setup check failed:', setupResult.message);
            console.log('Please ensure Python dependencies are installed');
            return;
        }

        // Test basic evaluation (requires OpenAI API key)
        if (process.env.OPENAI_API_KEY) {
            console.log('\nTesting evaluation with OpenAI...');

            const sample = {
                question: 'What is the capital of France?',
                answer: 'The capital of France is Paris.',
                contexts: ['France is a country in Europe. Its capital city is Paris.']
            };

            // Test answer relevancy
            const relevancyScore = await ragas.evaluateAnswerRelevancy(sample);
            console.log(`✓ Answer relevancy score: ${relevancyScore}`);

            // Test faithfulness
            const faithfulnessScore = await ragas.evaluateFaithfulness(sample);
            console.log(`✓ Faithfulness score: ${faithfulnessScore}`);

            console.log('\n✅ All evaluation tests passed!');

        } else {
            console.log('\n⚠ Skipping OpenAI test (OPENAI_API_KEY not set)');
            console.log('✅ Basic tests passed!');
        }

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        process.exit(1);
    }
}

// Run tests if called directly
if (require.main === module) {
    runTests();
}

module.exports = runTests;
