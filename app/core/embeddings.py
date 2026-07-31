from app.core.config import settings
from google import genai
from google.genai import types
from google.genai import errors as genai_errors
from fastapi import HTTPException

client = genai.Client(api_key=settings.gemini_api_key)

def generate_embedding(text: str) -> list[float]:
    try:
        result = client.models.embed_content(
            model="gemini-embedding-001",
            contents=text,
            config=types.EmbedContentConfig(task_type="RETRIEVAL_DOCUMENT", output_dimensionality=384)
        )

        return result.embeddings[0].values
    except genai_errors.APIError as e:
        raise HTTPException(status_code=502, detail=f"Embedding service error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected embedding error: {str(e)}")

def generate_embedding_batch(text: list[str]) -> list[list[float]]:
    try:
        result = client.models.embed_content(
            model="gemini-embedding-001",
            contents=text,
            config=types.EmbedContentConfig(task_type="RETRIEVAL_DOCUMENT", output_dimensionality=384)
        )

        return [vector.values for vector in result.embeddings]

    except genai_errors.APIError as e:
        raise HTTPException(status_code=502, detail=f"Embedding service error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected embedding error: {str(e)}")