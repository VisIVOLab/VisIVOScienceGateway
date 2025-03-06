# Usa l'immagine ufficiale di Python
FROM python:3.9

# Imposta la cartella di lavoro
WORKDIR /app

# Copia i file di dipendenze e installali
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia il codice del backend
COPY . .

# Espone la porta FastAPI
EXPOSE 8000

# Comando per avviare FastAPI con Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]