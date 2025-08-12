const RagasJS = require('../index');

async function testEvaluations() {
    console.log('🧪 Testing ragas-js evaluations...\n');

    const ragas = new RagasJS();

    try {
        // Test sample data
        const sampleData = {
            question: "What is the capital of France?",
            answer: "Paris is the capital of France.",
            contexts: ["France is a country in Europe. Its capital city is Paris."]
        };

        console.log('📊 Testing answer relevancy...');
        try {
            const relevancyScore = await ragas.evaluateAnswerRelevancy(sampleData);
            console.log(`✓ Answer relevancy score: ${relevancyScore}`);
        } catch (error) {
            console.log(`❌ Answer relevancy failed: ${error.message}`);
        }

        console.log('\n📊 Testing faithfulness...');
        try {
            const faithfulnessScore = await ragas.evaluateFaithfulness(sampleData);
            console.log(`✓ Faithfulness score: ${faithfulnessScore}`);
        } catch (error) {
            console.log(`❌ Faithfulness failed: ${error.message}`);
        }

        console.log('\n📊 Testing context precision...');
        try {
            const contextScore = await ragas.evaluateContextPrecision(sampleData);
            console.log(`✓ Context precision score: ${contextScore}`);
        } catch (error) {
            console.log(`❌ Context precision failed: ${error.message}`);
        }

        console.log('\n📊 Testing aspect critic...');
        try {
            const aspectScore = await ragas.evaluateAspect(sampleData, {
                name: 'clarity',
                definition: 'Evaluate if the answer is clear and easy to understand'
            });
            console.log(`✓ Aspect score: ${aspectScore}`);
        } catch (error) {
            console.log(`❌ Aspect critic failed: ${error.message}`);
        }

        console.log('\n🎉 Evaluation tests completed!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
}

testEvaluations();
