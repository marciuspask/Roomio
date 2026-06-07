FROM --platform=linux/amd64 python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Copy uv binary from the official image (faster than pip install uv)
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

# Install runtime dependencies (no build-system in pyproject.toml → uv installs
# deps only, skips building the package itself)
COPY pyproject.toml .
RUN uv pip install --system --no-cache .

COPY src/ ./src/

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--app-dir", "src"]
