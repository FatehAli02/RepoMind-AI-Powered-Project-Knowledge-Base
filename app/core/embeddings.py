from app.core.config import settings
from google import genai
from google.genai import types

client = genai.Client(api_key=settings.gemini_api_key)

def generate_embedding(text: str) -> list[float]:
    result = client.models.embed_content(
        model="gemini-embedding-001",
        contents=text,
        config=types.EmbedContentConfig(task_type="RETRIEVAL_DOCUMENT", output_dimensionality=384)
    )

    return result.embeddings[0].values

def generate_embedding_batch(text: str) -> list[list[float]]:
    result = client.models.embed_content(
        model="gemini-embedding-001",
        contents=text,
        config=types.EmbedContentConfig(task_type="RETRIEVAL_DOCUMENT", output_dimensionality=384)
    )

    return [vector.values for vector in result.embeddings]