FROM python:3.12-slim

RUN groupadd -r vaultuser && useradd -r -g vaultuser vaultuser

WORKDIR /vault

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY pii_vault/ .

RUN chown -R vaultuser:vaultuser /vault
USER vaultuser

EXPOSE 8888

CMD ["gunicorn", "--bind", "0.0.0.0:8888", "--workers", "2", "--timeout", "60", "wsgi:app"]
