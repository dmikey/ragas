const RagasJS = require('../index');

async function main() {
    try {
        console.log('🚀 Starting Ragas evaluation example...\n');

        // Initialize Ragas
        const ragas = new RagasJS();

        // Check setup first
        console.log('🔧 Checking Python setup...');
        const isReady = await ragas.checkSetup();
        if (!isReady) {
            console.error('❌ Ragas Python dependencies not properly installed');
            console.log('Please run: pip install ragas openai langchain langchain-openai');
            return;
        }
        console.log('✅ Setup check passed\n');

        // Example 1: Basic RAG evaluation with individual metrics
        console.log('📊 Example 1: Basic RAG Evaluation');
        const ragSample = {
            user_input: "What is the capital of France?",
            retrieved_contexts: [
                "Paris is the capital and largest city of France.",
                "France is a country in Western Europe.",
                "The Eiffel Tower is located in Paris, France."
            ],
            response: "The capital of France is Paris, which is also its largest city.",
            reference: "Paris is the capital of France."
        };

        try {
            // Note: These require LLM setup (OpenAI API key)
            if (process.env.OPENAI_API_KEY) {
                const relevancyScore = await ragas.evaluateAnswerRelevancy(ragSample);
                console.log(`Answer Relevancy Score: ${relevancyScore.toFixed(3)}`);

                const faithfulnessScore = await ragas.evaluateFaithfulness(ragSample);
                console.log(`Faithfulness Score: ${faithfulnessScore.toFixed(3)}`);

                const precisionScore = await ragas.evaluateContextPrecision(ragSample);
                console.log(`Context Precision Score: ${precisionScore.toFixed(3)}\n`);
            } else {
                console.log('⚠️ Skipping LLM-based metrics (OPENAI_API_KEY not set)\n');
            }
        } catch (error) {
            console.log(`⚠️ LLM evaluation failed: ${error.message}\n`);
        }

        // Example 2: Custom aspect evaluation
        console.log('🤖 Example 2: Custom Aspect Evaluation');
        const aspectSample = {
            user_input: "Explain quantum computing in simple terms",
            response: "Quantum computing uses quantum mechanical phenomena like superposition and entanglement to process information in ways that classical computers cannot. Unlike classical bits that are either 0 or 1, quantum bits (qubits) can exist in multiple states simultaneously, allowing quantum computers to perform certain calculations exponentially faster.",
        };

        const aspectConfig = {
            name: "scientific_accuracy",
            definition: "Evaluate if the response is scientifically accurate and uses correct terminology"
        };

        try {
            if (process.env.OPENAI_API_KEY) {
                const aspectScore = await ragas.evaluateAspect(aspectSample, aspectConfig);
                console.log(`Scientific Accuracy Score: ${aspectScore}\n`);
            } else {
                console.log('⚠️ Skipping aspect evaluation (OPENAI_API_KEY not set)\n');
            }
        } catch (error) {
            console.log(`⚠️ Aspect evaluation failed: ${error.message}\n`);
        }

        // Example 3: Batch evaluation 
        console.log('📋 Example 3: Batch Evaluation');
        const batchSamples = [
            {
                user_input: "What is machine learning?",
                retrieved_contexts: [
                    "Machine learning is a subset of artificial intelligence that focuses on algorithms.",
                    "ML algorithms can learn patterns from data without explicit programming."
                ],
                response: "Machine learning is a type of AI that allows computers to learn from data.",
                reference: "Machine learning is a subset of AI focused on learning from data."
            },
            {
                user_input: "How does photosynthesis work?",
                retrieved_contexts: [
                    "Photosynthesis converts light energy into chemical energy in plants.",
                    "Chlorophyll is the key molecule that captures light energy."
                ],
                response: "Photosynthesis is how plants convert sunlight into energy using chlorophyll.",
                reference: "Plants use photosynthesis to convert light into chemical energy."
            }
        ];

        try {
            if (process.env.OPENAI_API_KEY) {
                const batchResults = await ragas.evaluateBatch(batchSamples, ['answer_relevancy', 'faithfulness']);
                console.log('Batch Evaluation Results:');
                batchResults.forEach((result, index) => {
                    console.log(`Sample ${index + 1}:`);
                    Object.entries(result).forEach(([metric, score]) => {
                        console.log(`  ${metric}: ${score.toFixed(3)}`);
                    });
                });
                console.log();
            } else {
                console.log('⚠️ Skipping batch evaluation (OPENAI_API_KEY not set)\n');
            }
        } catch (error) {
            console.log(`⚠️ Batch evaluation failed: ${error.message}\n`);
        }

        // Example 4: Test data generation
        console.log('🔄 Example 4: Test Data Generation');
        const documents = [
            "Climate change refers to long-term shifts in global temperatures and weather patterns.",
            "The greenhouse effect is caused by gases like CO2 trapping heat in Earth's atmosphere.",
            "Renewable energy sources include solar, wind, and hydroelectric power."
        ];

        try {
            const syntheticData = await ragas.generateTestData(documents, {
                num_samples: 3,
                include_reasoning: true
            });

            console.log('Generated Test Data:');
            syntheticData.forEach((item, index) => {
                console.log(`\nGenerated Sample ${index + 1}:`);
                console.log(`Question: ${item.user_input}`);
                console.log(`Expected Answer: ${item.reference}`);
                if (item.retrieved_contexts) {
                    console.log(`Context: ${item.retrieved_contexts[0]}`);
                }
            });
        } catch (error) {
            console.log(`⚠️ Test data generation failed: ${error.message}`);
        }

        console.log('\n✅ Examples completed successfully!');

        if (!process.env.OPENAI_API_KEY) {
            console.log('\n💡 Tip: Set OPENAI_API_KEY environment variable to try LLM-based evaluations');
        }

    } catch (error) {
        console.error('❌ Error during evaluation:', error.message);
        console.error('Stack trace:', error.stack);
        process.exit(1);
    }
}

// Run the examples
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { main };
