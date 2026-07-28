
def chunk_text(text: str, chunk_size: int = 500, chunk_overlap: int = 50) -> list[str]:
    chunks = []
    start = 0
    text_len = len(text)

    while(start < text_len):
        end = start + chunk_size

        if text_len < end:
            last_space = text.rfind(' ', start, end)

            if last_space != -1:
                end = last_space

        chunks.append(text[start:end].strip())

        start = end - chunk_overlap

    return chunks