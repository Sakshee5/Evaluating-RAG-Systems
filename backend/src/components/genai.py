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
- Include all chunks in the json response even if they have 0% relevance and keep the order of chunks same as in the context

JSON RESPONSE FORMAT:
{{
"answer": "your comprehensive answer here",
"relevance_analysis": [
{{
    "chunk_number": 1,
    "relevance_score": 15
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
- Sum of relevance scores of all chunks should be 100%.
- Unused chunks can have 0% relevance and if only one chunk is used, it should have 100% relevance.  Even if 0% relevance, include all chunks in json response.
- The response must be a VALID JSON object without additional text

JSON RESPONSE FORMAT:
{{
  "answer": "your comprehensive answer here",
  "relevance_analysis": [
    {{
      "chunk_number": 1,
      "relevance_score": 65
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
- The task is to analyze multiple RAG configurations and determine which one performs best based on the provided metrics and results.
- Getting the correct final answer may not always be the best indicator of a good retrieval system. Analyze both the "retrieval" and "generation" components of the RAG pipeline.
- Identify patterns that indicate an optimized or suboptimal process and the possible reasons for it.
- Judge which answer is better overall in terms of information covered.


Meaning of the Metrics in Input Data
- Similarity Score: Similarity between the query and the chunk calculated using the similarity metric chosen in the configuration
- Relevance Score: Assigned by an LLM to the chunk based on whether the data from the chunk was used to answer the query.
- RUS: How well does the retrieval system rank relevant chunks? A combination of below 3 metrics.
- Normalized DCR: How well does the retrieval system rank relevant chunks?
- Similarity-Relevance Correlation: How well do similarity scores predict relevance?
- Wasted Similarity Penalty: How much similarity is wasted on irrelevant chunks?


Recommendations
- Recommend the best configuration based on the metrics and accuracy of final answer and a brief rationale.

## Output Format
{{
    "recommendation": "keep it brief, list best configuration details i.e. chunking strategy, embedding model, similarity metric, num chunks, etc.",
    "analysis": ["insights about the data", "whatever you think is important to know. dont throw numbers, just explain the metrics in a way that is easy to understand", 'keep it relevant, explain why you made the recommendation, short and concise']
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



    

