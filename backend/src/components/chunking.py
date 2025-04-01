import re
import nltk
from nltk.tokenize import sent_tokenize
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')
import tiktoken

def chunk_by_sentence(text, size=1):
    """Split text into chunks by sentence, with each chunk containing size sentences"""
    sentences = sent_tokenize(text)
    chunks = []
    for i in range(0, len(sentences), size):
        chunk = " ".join(sentences[i:i + size])
        chunks.append(chunk)
    return chunks

def chunk_by_paragraph(text, size=1):
    """Split text into chunks by paragraph, with each chunk containing size paragraphs"""
    # Split by double newlines or more to separate paragraphs
    paragraphs = re.split(r'\n\s*\n', text)
    # Filter out empty paragraphs and strip whitespace
    paragraphs = [p.strip() for p in paragraphs if p.strip()]
    
    chunks = []
    for i in range(0, len(paragraphs), size):
        chunk = "\n\n".join(paragraphs[i:i + size])
        chunks.append(chunk)
    return chunks

def chunk_by_page(text, page_texts, size=1):
    """Return chunks by page, with each chunk containing size pages"""
    chunks = []
    for i in range(0, len(page_texts), size):
        chunk = "\n\n".join(page_texts[i:i + size])
        chunks.append(chunk)
    return chunks

def num_tokens_from_string(string: str, encoding_name: str = "cl100k_base") -> int:
    """Returns the number of tokens in a text string."""
    encoding = tiktoken.get_encoding(encoding_name)
    num_tokens = len(encoding.encode(string))
    return num_tokens

def chunk_by_tokens(text, token_size=256, overlap=20, encoding_name="cl100k_base"):
    """Split text into chunks of approximately token_size tokens with optional overlap"""
    encoding = tiktoken.get_encoding(encoding_name)
    tokens = encoding.encode(text)
    
    chunks = []
    i = 0
    while i < len(tokens):
        # Get chunk of tokens
        chunk_end = min(i + token_size, len(tokens))
        chunk_tokens = tokens[i:chunk_end]
        
        # Decode back to text
        chunk_text = encoding.decode(chunk_tokens)
        chunks.append(chunk_text)
        
        # Move to next chunk, considering overlap
        i += token_size - overlap
    
    return chunks