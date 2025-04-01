from typing import List, Dict, Any
import os
import json
import requests
from dotenv import load_dotenv
from google import genai

# Load environment variables from .env file
load_dotenv()

def format_context_for_llm(chunks: List[str]) -> str:
    """
    Format chunks as context for the LLM.
    """
    context = ""
    for chunk, chunk_no in chunks:
        context += f"Chunk {chunk_no+1}:\n{chunk}\n\n"

    return f"CONTEXT:\n{context}\n\nBased on the above context, "

def generate_gemini_response(query: str, context: str, api_key: str) -> dict:
    """
    Generate a JSON-formatted response from Google Gemini API based on the query and context.
    Returns a dictionary with 'answer' and 'relevance_analysis' keys.
    """
    try:
        if not api_key:
            return {"error": "Gemini API key not found. Please set GEMINI_API_KEY in your environment variables."}

        client = genai.Client(api_key=api_key)
        
        # Structure the prompt to request JSON format explicitly
        prompt = f"""{context}

Based purely on the above context, respond with a valid JSON object containing:

1. An "answer" field with your response to: {query}

2. A "relevance_analysis" array of objects, each containing:
   - "chunk_number": the chunk number referenced
   - "relevance_score": percentage (0-100) of relevance

Ensure:
- All relevance scores sum to 100%
- Unused chunks can have 0% relevance
- Essential chunks can have up to 100% relevance
- The response must be a VALID JSON object without additional text

JSON RESPONSE FORMAT:
{{
  "answer": "your comprehensive answer here",
  "relevance_analysis": [
    {{
      "chunk_number": 1,
      "relevance_score": 25
    }},
    ...
  ]
}}
"""
        
        # Set response format to JSON
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
            generation_config={
                "response_mime_type": "application/json",
            }
        )
        
        # Parse the JSON response
        try:
            # If using Google's library that already gives structured JSON:
            if hasattr(response, 'json'):
                return response.json()
            # Otherwise parse the text
            else:
                import json
                return json.loads(response.text)
        except json.JSONDecodeError:
            return {
                "error": "Failed to parse JSON from Gemini response",
                "raw_response": response.text
            }
        
    except Exception as e:
        return {"error": f"Error: {str(e)}"}
    

def generate_openai_response(query: str, context: str, api_key: str) -> dict:
    """
    Generate a JSON-formatted response from OpenAI API based on the query and context.
    Returns a dictionary with 'answer' and 'relevance_analysis' keys.
    """
    try:
        if not api_key:
            return {"error": "OpenAI API key not found. Please set OPENAI_API_KEY in your environment variables."}

        import openai
        client = openai.OpenAI(api_key=api_key)
        
        # Structure the system and user messages to request JSON format
        system_message = f"""You are a helpful assistant that can answer questions based on the provided context."""
        user_message = f"""{context}

Based purely on the above context, respond with a valid JSON object containing:

1. An "answer" field with your response to: {query}

2. A "relevance_analysis" array of objects, each containing:
   - "chunk_number": the chunk number referenced
   - "relevance_score": percentage (0-100) of relevance

Ensure:
- All relevance scores sum to 100%
- Unused chunks can have 0% relevance
- Essential chunks can have up to 100% relevance
- The response must be a VALID JSON object without additional text

JSON RESPONSE FORMAT:
{{
  "answer": "your comprehensive answer here",
  "relevance_analysis": [
    {{
      "chunk_number": 1,
      "relevance_score": 25
    }},
    ...
  ]
}}
"""
        
        # Call the OpenAI API with JSON response format
        response = client.chat.completions.create(
            model="gpt-4o",  # or your preferred model
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": user_message}
            ],
            temperature=0.2  # Lower temperature for more consistent JSON formatting
        )
        
        # Parse the JSON response
        try:
            import json
            return json.loads(response.choices[0].message.content)
        except json.JSONDecodeError:
            return {
                "error": "Failed to parse JSON from OpenAI response",
                "raw_response": response.choices[0].message.content
            }
        
    except Exception as e:
        return {"error": f"Error: {str(e)}"}
