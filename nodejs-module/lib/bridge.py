#!/usr/bin/env python3
"""
Bridge script between Node.js and Ragas Experimental Python library
"""

import sys
import json
import traceback
import asyncio
import os
from typing import Dict, Any, List

try:
    from ragas_experimental import Dataset, experiment, llm_factory
    from ragas_experimental.metrics import DiscreteMetric, NumericMetric
    RAGAS_AVAILABLE = True
    RAGAS_VERSION = "experimental"
except ImportError as e:
    RAGAS_AVAILABLE = False
    IMPORT_ERROR = str(e)

# Try to import OpenAI if available
try:
    from openai import OpenAI, AsyncOpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False


def get_default_llm():
    """Get LLM instance"""
    try:
        if not OPENAI_AVAILABLE:
            raise Exception("OpenAI package not available")
            
        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key:
            raise Exception("OPENAI_API_KEY environment variable not set")
            
        client = AsyncOpenAI(api_key=api_key)
        return llm_factory("openai", "gpt-3.5-turbo", client=client)
    except Exception as e:
        print(f"Error creating LLM: {e}", file=sys.stderr)
        return None


async def answer_relevancy(data: Dict[str, Any]) -> float:
    """Evaluate answer relevancy using experimental ragas"""
    if not RAGAS_AVAILABLE:
        raise Exception(f"Ragas not available: {IMPORT_ERROR}")
    
    llm = get_default_llm()
    if not llm:
        raise Exception("Failed to create LLM")
    
    # Create the prompt as a simple string
    prompt_text = "Evaluate if the answer is relevant to the question. Return 'relevant' if the answer addresses the question, 'irrelevant' otherwise.\nQuestion: {question}\nAnswer: {answer}"
    
    metric = DiscreteMetric(
        name="answer_relevancy",
        prompt=prompt_text,
        allowed_values=["relevant", "irrelevant"],
    )
    
    result = await metric.ascore(
        llm=llm,
        question=data.get('question', ''),
        answer=data.get('answer', '')
    )
    
    return 1.0 if result.value == "relevant" else 0.0


async def faithfulness(data: Dict[str, Any]) -> float:
    """Evaluate faithfulness using experimental ragas"""
    if not RAGAS_AVAILABLE:
        raise Exception(f"Ragas not available: {IMPORT_ERROR}")
    
    llm = get_default_llm()
    if not llm:
        raise Exception("Failed to create LLM")
    
    prompt_text = "Check if the answer is faithful to the context. Return 'faithful' if the answer is supported by the context, 'unfaithful' otherwise.\nContext: {context}\nAnswer: {answer}"
    
    metric = DiscreteMetric(
        name="faithfulness",
        prompt=prompt_text,
        allowed_values=["faithful", "unfaithful"],
    )
    
    result = await metric.ascore(
        llm=llm,
        context="\n".join(data.get('contexts', [])),
        answer=data.get('answer', '')
    )
    
    return 1.0 if result.value == "faithful" else 0.0


async def context_precision(data: Dict[str, Any]) -> float:
    """Evaluate context precision using experimental ragas"""
    if not RAGAS_AVAILABLE:
        raise Exception(f"Ragas not available: {IMPORT_ERROR}")
    
    llm = get_default_llm()
    if not llm:
        raise Exception("Failed to create LLM")
    
    prompt_text = "Check if the retrieved context is precise and relevant to the question. Return 'precise' if the context is relevant, 'imprecise' otherwise.\nQuestion: {question}\nContext: {context}"
    
    metric = DiscreteMetric(
        name="context_precision",
        prompt=prompt_text,
        allowed_values=["precise", "imprecise"],
    )
    
    result = await metric.ascore(
        llm=llm,
        question=data.get('question', ''),
        context="\n".join(data.get('contexts', []))
    )
    
    return 1.0 if result.value == "precise" else 0.0


async def aspect_critic(data: Dict[str, Any]) -> float:
    """Evaluate using aspect critic"""
    if not RAGAS_AVAILABLE:
        raise Exception(f"Ragas not available: {IMPORT_ERROR}")
    
    llm = get_default_llm()
    if not llm:
        raise Exception("Failed to create LLM")
    
    config = data.get('config', {})
    aspect_name = config.get('name', 'quality')
    aspect_definition = config.get('definition', 'Evaluate the overall quality of the response')
    
    prompt_text = f"{aspect_definition}\nEvaluate the following:\nQuestion: {{question}}\nAnswer: {{answer}}\nReturn 'good' if it meets the criteria, 'poor' otherwise."
    
    metric = DiscreteMetric(
        name=aspect_name,
        prompt=prompt_text,
        allowed_values=["good", "poor"],
    )
    
    sample_data = data.get('sample', {})
    result = await metric.ascore(
        llm=llm,
        question=sample_data.get('question', ''),
        answer=sample_data.get('answer', '')
    )
    
    return 1.0 if result.value == "good" else 0.0


async def batch_evaluate(data: Dict[str, Any]) -> List[Dict[str, float]]:
    """Evaluate multiple samples"""
    if not RAGAS_AVAILABLE:
        raise Exception(f"Ragas not available: {IMPORT_ERROR}")
    
    samples_data = data['samples']
    metrics_list = data['metrics']
    
    results = []
    
    for sample in samples_data:
        sample_results = {}
        
        for metric_name in metrics_list:
            try:
                if metric_name == 'answer_relevancy':
                    score = await answer_relevancy(sample)
                elif metric_name == 'faithfulness':
                    score = await faithfulness(sample)
                elif metric_name == 'context_precision':
                    score = await context_precision(sample)
                else:
                    continue
                    
                sample_results[metric_name] = float(score)
            except Exception as e:
                print(f"Error evaluating {metric_name}: {e}", file=sys.stderr)
                sample_results[metric_name] = 0.0
        
        results.append(sample_results)
    
    return results


def check_setup(data: Dict[str, Any]) -> Dict[str, str]:
    """Check if Ragas experimental is properly installed"""
    if not RAGAS_AVAILABLE:
        return {"status": "error", "message": f"Ragas experimental not available: {IMPORT_ERROR}"}
    
    if not OPENAI_AVAILABLE:
        return {"status": "error", "message": "OpenAI package not available. Install with: pip install openai"}
    
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        return {"status": "warning", "message": "OPENAI_API_KEY environment variable not set. Set it to use LLM evaluations."}
    
    try:
        # Try to create an LLM instance
        llm = get_default_llm()
        if llm:
            return {"status": "ok", "message": "Ragas experimental is properly installed and LLM is available"}
        else:
            return {"status": "warning", "message": "Ragas experimental is installed but LLM creation failed"}
    except Exception as e:
        return {"status": "error", "message": f"Error testing setup: {e}"}


def create_discrete_metric(data: Dict[str, Any]) -> Dict[str, Any]:
    """Create a custom discrete metric"""
    if not RAGAS_AVAILABLE:
        raise Exception(f"Ragas not available: {IMPORT_ERROR}")
    
    name = data.get('name', 'custom_metric')
    prompt = data.get('prompt', 'Evaluate the input.')
    allowed_values = data.get('allowed_values', ['good', 'bad'])
    
    metric = DiscreteMetric(
        name=name,
        prompt=prompt,
        allowed_values=allowed_values
    )
    
    return {
        "name": name,
        "type": "discrete",
        "allowed_values": allowed_values,
        "created": True
    }


async def evaluate_custom_metric(data: Dict[str, Any]) -> Dict[str, Any]:
    """Evaluate using a custom metric"""
    if not RAGAS_AVAILABLE:
        raise Exception(f"Ragas not available: {IMPORT_ERROR}")
    
    llm = get_default_llm()
    if not llm:
        raise Exception("Failed to create LLM")
    
    # Metric configuration
    metric_config = data.get('metric', {})
    name = metric_config.get('name', 'custom_metric')
    prompt = metric_config.get('prompt', 'Evaluate the input.')
    allowed_values = metric_config.get('allowed_values', ['good', 'bad'])
    
    # Create the metric
    metric = DiscreteMetric(
        name=name,
        prompt=prompt,
        allowed_values=allowed_values
    )
    
    # Evaluation parameters (everything except 'metric')
    eval_params = {k: v for k, v in data.items() if k != 'metric'}
    
    result = await metric.ascore(llm=llm, **eval_params)
    
    return {
        "value": result.value,
        "reason": result.reason if hasattr(result, 'reason') else None,
        "metric_name": name
    }


# Function registry
FUNCTIONS = {
    'answer_relevancy': answer_relevancy,
    'faithfulness': faithfulness,
    'context_precision': context_precision,
    'aspect_critic': aspect_critic,
    'batch_evaluate': batch_evaluate,
    'check_setup': check_setup,
    'create_discrete_metric': create_discrete_metric,
    'evaluate_custom_metric': evaluate_custom_metric
}


async def main():
    """Main entry point for JSON communication"""
    try:
        # Read JSON input from stdin
        input_line = sys.stdin.read().strip()
        if not input_line:
            print(json.dumps({"error": "No input provided"}))
            sys.exit(1)
        
        request = json.loads(input_line)
        function_name = request.get('function')
        args = request.get('args', {})
        
        if not RAGAS_AVAILABLE and function_name != 'check_setup':
            print(json.dumps({"error": f"Ragas experimental not available: {IMPORT_ERROR}"}))
            sys.exit(1)
        
        if function_name not in FUNCTIONS:
            print(json.dumps({"error": f"Unknown function: {function_name}"}))
            sys.exit(1)
        
        func = FUNCTIONS[function_name]
        
        # Handle async functions
        if asyncio.iscoroutinefunction(func):
            result = await func(args)
        else:
            result = func(args)
        
        print(json.dumps({"data": result}))
        
    except Exception as e:
        error_msg = f"{type(e).__name__}: {str(e)}"
        traceback.print_exc(file=sys.stderr)
        print(json.dumps({"error": error_msg}))
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
