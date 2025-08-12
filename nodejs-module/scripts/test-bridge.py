#!/usr/bin/env python3
"""
Simple test bridge script
"""

import sys
import json
import asyncio

def check_setup():
    return {"status": "ok", "message": "Test bridge is working"}

async def main():
    try:
        # Read JSON input from stdin
        input_line = sys.stdin.read().strip()
        if not input_line:
            print(json.dumps({"error": "No input provided"}))
            sys.exit(1)
        
        request = json.loads(input_line)
        function_name = request.get('function')
        
        if function_name == 'check_setup':
            result = check_setup()
            print(json.dumps({"data": result}))
        else:
            print(json.dumps({"error": f"Unknown function: {function_name}"}))
        
    except Exception as e:
        print(json.dumps({"error": f"Error: {str(e)}"}))
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
