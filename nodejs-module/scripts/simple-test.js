const RagasJS = require('../index');

async function simpleTest() {
    console.log('🔧 Testing ragas-js setup...\n');

    try {
        // Test 1: Initialize
        const ragas = new RagasJS();
        console.log('✓ RagasJS initialized');

        // Test 2: Check setup
        const setupResult = await ragas.callPython('check_setup', {});
        console.log('✓ Setup check:', setupResult);

        // Test 3: Simple sample (without LLM for now)
        const sample = {
            user_input: "What is the capital of France?",
            response: "Paris is the capital of France.",
            reference: "Paris"
        };

        console.log('✓ Sample created:', sample);
        console.log('\n🎉 Basic setup test passed!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Full error:', error);
    }
}

simpleTest();
