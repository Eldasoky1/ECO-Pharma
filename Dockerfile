FROM python:3.11-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

FROM python:3.11-slim
RUN useradd --create-home --shell /bin/bash appuser
WORKDIR /app
COPY --from=builder /install /usr/local
COPY smart_eco_pharma/ ./smart_eco_pharma/

USER appuser
EXPOSE 8000
CMD ["uvicorn", "smart_eco_pharma.main:app", "--host", "0.0.0.0", "--port", "8000"]
