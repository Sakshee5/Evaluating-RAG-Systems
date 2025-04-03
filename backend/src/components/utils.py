from typing import List
import json
from dotenv import load_dotenv
from google import genai
import openai

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
- Sum of relevance scores of all chunks should be 100%
- Unused chunks can have 0% relevance and if only one chunk is used, it should have 100% relevance
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
        config={
            "response_mime_type": "application/json",
        }
    )
    
    return json.loads(response.text)
        
def generate_openai_response(query: str, context: str, api_key: str) -> dict:
    """
    Generate a JSON-formatted response from OpenAI API based on the query and context.
    Returns a dictionary with 'answer' and 'relevance_analysis' keys.
    """
    try:
        if not api_key:
            return {"error": "OpenAI API key not found. Please set OPENAI_API_KEY in your environment variables."}
        
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
- Sum of relevance scores of all chunks should be 100%
- Unused chunks can have 0% relevance and if only one chunk is used, it should have 100% relevance
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
            model="gpt-4o-mini",
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": user_message}
            ],
            temperature=0.2  # Lower temperature for more consistent JSON formatting
        )
        

        return json.loads(response.choices[0].message.content)
        
    except Exception as e:
        return {"error": f"Error: {str(e)}"}
    

system_prompt = """You are a specialized evaluator for Retrieval-Augmented Generation (RAG) systems. Your task is to analyze multiple RAG configurations and determine which one performs best based on the provided metrics and results. You will examine how well the retrieval mechanism aligns with the generation process and identify potential issues in the RAG pipeline."""

user_prompt = """## Input Data
{input_data}

## Evaluation Guidelines
1. Retrieval-Generation Alignment: Analyze the correlation between similarity scores and relevance 
2. Configuration Robustness: Evaluate how consistently each configuration performs across different questions
### Answer Quality vs. Retrieval Quality: Identify cases where correct answers are generated despite poor retrieval and why

## Output Format
{{
    "recommendation": "keep it brief, list best configuration details i.e. chunking strategy, embedding model, similarity metric, num chunks, etc.",
    "analysis": ["insights about the data", "whatever you think is important to know", 'keep it relevant, short and concise']
}}
"""


def generate_judge_openai_response(api_key: str, input_data) -> dict:
    """
    Generate a JSON-formatted response from Judge API based on the query and context.
    Returns a dictionary with 'answer' and 'relevance_analysis' keys.
    """
    try:
        client = openai.OpenAI(api_key=api_key)

        response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt.format(input_data=input_data)}
                    ],
                response_format={"type": "json_object"},
                temperature=0.2
        )

        return json.loads(response.choices[0].message.content)
    except Exception as e:
        return {"error": f"Error: {str(e)}"}

def generate_judge_gemini_response(api_key: str, input_data) -> dict:
    """
    Generate a JSON-formatted response from Judge API based on the query and context.
    Returns a dictionary with 'answer' and 'relevance_analysis' keys.
    """
    try:
        client = genai.Client(api_key=api_key)

        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=system_prompt + "\n\n" + user_prompt.format(input_data=input_data),
            config={
                "response_mime_type": "application/json",
            }   
        )

        return json.loads(response.text)
    except Exception as e:
        return {"error": f"Error: {str(e)}"}



    

