
def chunk_text(text: str, chunk_size: int = 500, chunk_overlap: int = 50) -> list[str]:
    chunks = []
    start = 0

    while(start < len(text)):
        end = start + chunk_size

        chunks.append(text[start:end])

        start += chunk_size - chunk_overlap

    return chunks