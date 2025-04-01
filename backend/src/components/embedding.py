from sentence_transformers import SentenceTransformer
from transformers import BertModel, BertTokenizer, DistilBertModel, DistilBertTokenizer, GPT2Model, GPT2Tokenizer, T5Tokenizer, T5Model
from typing import List, Tuple

class EmbeddingGenerator:
    sentence_transformer = SentenceTransformer("all-MiniLM-L6-v2", device = "cpu")
    bert_tokenizer = BertTokenizer.from_pretrained("bert-base-uncased")
    bert_model = BertModel.from_pretrained("bert-base-uncased")
    distilbert_tokenizer = DistilBertTokenizer.from_pretrained("distilbert-base-uncased")
    distilbert_model = DistilBertModel.from_pretrained("distilbert-base-uncased")
    gpt2_tokenizer = GPT2Tokenizer.from_pretrained("gpt2")
    gpt2_tokenizer.pad_token = gpt2_tokenizer.eos_token 
    gpt2_model = GPT2Model.from_pretrained("gpt2")
    fine_tuned_model = SentenceTransformer("philschmid/bge-base-financial-matryoshka")

    @staticmethod
    def get_embeddings(texts: List[str], model_name: str) -> List[List[float]]:
        embeddings = []
        if model_name == "sentence-transformer":
            embeddings = EmbeddingGenerator.sentence_transformer.encode(texts).tolist()
        elif model_name == "bert":
            inputs = EmbeddingGenerator.bert_tokenizer(texts, padding=True, truncation=True, return_tensors="pt")
            outputs = EmbeddingGenerator.bert_model(**inputs)
            embeddings = outputs.last_hidden_state[:, 0, :].detach().numpy().tolist()
        elif model_name == "roberta":
            inputs = EmbeddingGenerator.roberta_tokenizer(texts, padding=True, truncation=True, return_tensors="pt")
            outputs = EmbeddingGenerator.roberta_model(**inputs)
            embeddings = outputs.last_hidden_state[:, 0, :].detach().numpy().tolist()
        elif model_name == "distilbert":
            inputs = EmbeddingGenerator.distilbert_tokenizer(texts, padding=True, truncation=True, return_tensors="pt")
            outputs = EmbeddingGenerator.distilbert_model(**inputs)
            embeddings = outputs.last_hidden_state[:, 0, :].detach().numpy().tolist()
        elif model_name == "gpt2":
            inputs = EmbeddingGenerator.gpt2_tokenizer(texts, padding=True, truncation=True, return_tensors="pt")
            outputs = EmbeddingGenerator.gpt2_model(**inputs)
            embeddings = outputs.last_hidden_state[:, -1, :].detach().numpy().tolist()
        elif model_name == "fine-tuned-financial":
            embeddings = EmbeddingGenerator.fine_tuned_model.encode(texts).tolist()
        else:
            raise ValueError(f"Unknown embedding model: {model_name}")
        return embeddings