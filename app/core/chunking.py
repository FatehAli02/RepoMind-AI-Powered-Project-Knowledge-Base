
def chunk_text(text: str, chunk_size: int = 500, chunk_overlap: int = 50) -> list[str]:
    chunks = []
    start = 0
    text_len = len(text)

    while(start < text_len):
        end = min(start + chunk_size, text_len)

        if end < text_len:
            last_space = text.rfind(' ', start, end)

            if last_space > start:
                end = last_space

        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)

        next_start = end - chunk_overlap
        start = next_start if next_start > start else end
        
    return chunks