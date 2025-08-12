const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

class RagasJS {
    constructor(options = {}) {
        this.pythonPath = options.pythonPath || 'python3';
        this.bridgePath = path.join(__dirname, 'bridge.py');
        this.timeout = options.timeout || 30000; // 30 seconds default

        // Verify bridge script exists
        if (!fs.existsSync(this.bridgePath)) {
            throw new Error(`Bridge script not found at ${this.bridgePath}`);
        }
    }

    /**
     * Execute a Python function with the given data
     * @param {string} functionName - The function to call in the bridge
     * @param {Object} data - The data to pass to the function
     * @returns {Promise<Object>} - The result from the Python function
     */
    async executePython(functionName, data) {
        return new Promise((resolve, reject) => {
            const payload = JSON.stringify({ function: functionName, data });
            const python = spawn(this.pythonPath, [this.bridgePath, payload]);

            let stdout = '';
            let stderr = '';

            const timeout = setTimeout(() => {
                python.kill();
                reject(new Error(`Python execution timed out after ${this.timeout}ms`));
            }, this.timeout);

            python.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            python.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            python.on('close', (code) => {
                clearTimeout(timeout);

                if (code !== 0) {
                    reject(new Error(`Python process failed with code ${code}: ${stderr}`));
                    return;
                }

                try {
                    const result = JSON.parse(stdout.trim());
                    if (result.error) {
                        reject(new Error(result.error));
                    } else {
                        resolve(result.data);
                    }
                } catch (parseError) {
                    reject(new Error(`Failed to parse Python output: ${parseError.message}\nOutput: ${stdout}`));
                }
            });

            python.on('error', (error) => {
                clearTimeout(timeout);
                reject(new Error(`Failed to spawn Python process: ${error.message}`));
            });
        });
    }

    /**
     * Call Python bridge with function name and data
     * @param {string} functionName - Function to call
     * @param {Object} data - Data to pass
     * @returns {Promise<any>} - Result from Python
     */
    async callPython(functionName, args = {}) {
        return new Promise((resolve, reject) => {
            const input = JSON.stringify({ function: functionName, args });
            const pythonProcess = spawn('/opt/homebrew/opt/python@3.10/bin/python3.10', [this.bridgePath], {
                stdio: ['pipe', 'pipe', 'pipe']
            });

            let stdout = '';
            let stderr = '';

            const timer = setTimeout(() => {
                pythonProcess.kill();
                reject(new Error(`Python process timed out after ${this.timeout}ms`));
            }, this.timeout);

            pythonProcess.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            pythonProcess.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            pythonProcess.on('close', (code) => {
                clearTimeout(timer);

                if (code !== 0) {
                    reject(new Error(`Python process failed with code ${code}: ${stderr}`));
                    return;
                }

                try {
                    const result = JSON.parse(stdout);
                    if (result.error) {
                        reject(new Error(result.error));
                    } else {
                        resolve(result.data);
                    }
                } catch (e) {
                    reject(new Error(`Failed to parse Python output: ${stdout}`));
                }
            });

            pythonProcess.on('error', (error) => {
                clearTimeout(timer);
                reject(new Error(`Failed to start Python process: ${error.message}`));
            });

            // Send input and close stdin
            pythonProcess.stdin.write(input);
            pythonProcess.stdin.end();
        });
    }

    // Core Ragas evaluation functions

    /**
     * Evaluate a single turn sample
     * @param {Object} sample - The sample data (SingleTurnSample format)
     * @param {Object} metric - The metric configuration
     * @returns {Promise<number>} - The evaluation score
     */
    async evaluateSingleTurn(sample, metric) {
        return this.callPython('evaluate_single_turn', { sample, metric });
    }

    /**
     * Evaluate using the main evaluate function
     * @param {Array|Object} dataset - Dataset or single sample
     * @param {Array} metrics - Array of metric configurations
     * @returns {Promise<Object>} - The evaluation results
     */
    async evaluate(dataset, metrics) {
        return this.callPython('evaluate_dataset', { dataset, metrics });
    }

    // Individual metric methods for convenience

    /**
     * Evaluate answer relevancy
     * @param {Object} sample - Sample with user_input, response, etc.
     * @returns {Promise<number>} - Relevancy score
     */
    async evaluateAnswerRelevancy(sample) {
        return this.callPython('answer_relevancy', sample);
    }

    /**
     * Evaluate faithfulness
     * @param {Object} sample - Sample with response, retrieved_contexts, etc.
     * @returns {Promise<number>} - Faithfulness score
     */
    async evaluateFaithfulness(sample) {
        return this.callPython('faithfulness', sample);
    }

    /**
     * Evaluate context precision
     * @param {Object} sample - Sample with user_input, retrieved_contexts, reference
     * @returns {Promise<number>} - Context precision score
     */
    async evaluateContextPrecision(sample) {
        return this.callPython('context_precision', sample);
    }

    /**
     * Evaluate using aspect critic
     * @param {Object} sample - Sample data
     * @param {Object} aspectConfig - Aspect configuration with name, definition
     * @returns {Promise<number>} - Binary score (0 or 1)
     */
    async evaluateAspect(sample, aspectConfig) {
        return this.callPython('aspect_critic', { sample, config: aspectConfig });
    }

    /**
     * Evaluate multiple samples
     * @param {Array} samples - Array of samples
     * @param {Array} metrics - Array of metric names
     * @returns {Promise<Array>} - Array of results for each sample
     */
    async batchEvaluate(samples, metrics) {
    const response = await this.callPython('batch_evaluate', {
      samples,
      metrics
    });
    return response;
  }

  /**
   * Create a custom discrete metric
   * @param {string} name - Name of the metric
   * @param {string} prompt - The prompt template for evaluation
   * @param {Array<string>} allowedValues - Allowed values for the metric
   * @returns {Promise<Object>} Metric configuration
   */
  async createDiscreteMetric(name, prompt, allowedValues) {
    const response = await this.callPython('create_discrete_metric', {
      name,
      prompt,
      allowed_values: allowedValues
    });
    return response;
  }

  /**
   * Evaluate using a custom metric
   * @param {Object} metric - Metric configuration
   * @param {Object} evaluationData - Data to evaluate
   * @returns {Promise<Object>} Evaluation result
   */
  async evaluateCustomMetric(metric, evaluationData) {
    const response = await this.callPython('evaluate_custom_metric', {
      metric,
      ...evaluationData
    });
    return response;
  }
  /**
   * Create a custom discrete metric
   * @param {string} name - Name of the metric
   * @param {string} prompt - The prompt template for evaluation
   * @param {Array<string>} allowedValues - Allowed values for the metric
   * @returns {Promise<Object>} Metric configuration
   */
  async createDiscreteMetric(name, prompt, allowedValues) {
    const response = await this.callPython('create_discrete_metric', {
      name,
      prompt,
      allowed_values: allowedValues
    });
    return response;
  }

  /**
   * Evaluate using a custom metric
   * @param {Object} metric - Metric configuration
   * @param {Object} evaluationData - Data to evaluate
   * @returns {Promise<Object>} Evaluation result
   */
  async evaluateCustomMetric(metric, evaluationData) {
    const response = await this.callPython('evaluate_custom_metric', {
      metric,
      ...evaluationData
    });
    return response;
  }

    /**
     * Generate test data
     * @param {Array} documents - Documents to generate from
     * @param {Object} config - Generation configuration
     * @returns {Promise<Array>} - Generated test samples
     */
    async generateTestData(documents, config = {}) {
        return this.callPython('generate_test_data', { documents, config });
    }

    /**
     * Check if the Python environment is properly set up
     * @returns {Promise<boolean>} - True if setup is valid
     */
    async checkSetup() {
        try {
            const result = await this.callPython('check_setup', {});
            return result;
        } catch (error) {
            return { status: 'error', message: error.message };
        }
    }
}

module.exports = RagasJS;
