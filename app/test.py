from core.chunking import chunk_text

# stress test with realistic whitespace patterns
text = "word " * 200  # lots of single spaces, exactly the pattern that could trigger the bug
chunks = chunk_text(text)
print(len(chunks), "chunks produced")
print(chunks[:3])