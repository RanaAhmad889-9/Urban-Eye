# ────────────────────────────────────────────────────
# UrbanEye ML Service — Hugging Face Spaces Dockerfile
# ────────────────────────────────────────────────────
# HF Spaces uses port 7860 by default.
# Free tier: 2 vCPU, 16 GB RAM → handles 400 MB models easily.

FROM python:3.11-slim

# System deps (needed for Pillow, scipy)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libglib2.0-0 libsm6 libxext6 libxrender-dev libgomp1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python deps first (Docker layer cache)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app code
COPY main.py .

# Copy your trained model files
# Make sure classifier.pt / unet.pt are inside the models/ folder
COPY models/ ./models/

# HF Spaces expects port 7860
EXPOSE 7860

# Create non-root user (HF Spaces requirement)
RUN useradd -m -u 1000 appuser && chown -R appuser /app
USER appuser

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860", "--workers", "1"]
