# RAG Analyzer

A tool for evaluating and optimizing Retrieval-Augmented Generation (RAG) pipelines. This project helps understand, analyze, and improve their RAG implementations by providing insights into retrieval performance and relevance.

## Problem Statement

RAG (Retrieval-Augmented Generation) has become a popular approach for enhancing large language models with external knowledge. However, evaluating and optimizing RAG pipelines presents several challenges:

1. Difficulty in determining if retrieved chunks are truly relevant
2. Lack of transparency in how similarity scores align with actual relevance
3. Challenges in identifying the optimal configuration for RAG pipelines
4. Need for systematic comparison between different RAG configurations

## Solution

RAG Analyzer addresses these challenges by providing:

- Detailed analysis of retrieval performance
- Comparison of different RAG configurations
- Visualization of similarity scores vs. actual relevance
- Tools for identifying optimal RAG pipeline configurations
- Transparent and explainable retrieval process

## Tech Stack

### Frontend
- React with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Shadcn UI components

### Backend
- FastAPI (Python) with RESTful API architecture

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Python 3.8 or higher

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The frontend application will be available at `http://localhost:5173`

### Backend Setup
```bash
# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
cd backend
pip install -r src/requirements.txt

# Start the server
fastapi dev src/main.py
```