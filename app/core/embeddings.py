import threading

_model = None
_lock = threading.Lock()

def _get_model():
    global _model
    if _model is None:
        with _lock:
            if _model is None:
                from fastembed import TextEmbedding
                _model = TextEmbedding(model_name="BAAI/bge-small-en-v1.5")
    return _model

def generate_embedding(text: str) -> list[float]:
    model = _get_model()
    vector = list(model.embed([text]))[0]

    return vector.tolist()