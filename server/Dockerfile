# ------------------------------------------------------
# Step 1: Pick a Python base image
# ------------------------------------------------------
FROM python:3.11-slim

# ------------------------------------------------------
# Step 2: Create a working directory inside the container
# ------------------------------------------------------
WORKDIR /app

# ------------------------------------------------------
# Step 3: Install system tools (optional for debugging)
# ------------------------------------------------------
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

# ------------------------------------------------------
# Step 4: Install Python dependencies first (Docker cache friendly)
# ------------------------------------------------------
# COPY server/requirements.txt ./server/requirements.txt
# RUN pip install --no-cache-dir -r server/requirements.txt
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

# ------------------------------------------------------
# Step 5: Copy the backend code into the container
# ------------------------------------------------------
# COPY server ./server

# ------------------------------------------------------
# Step 6: Expose FastAPI port
# ------------------------------------------------------
EXPOSE 8000

# ------------------------------------------------------
# Step 7: Start the API (uvicorn). Swap to gunicorn if you prefer.
# ------------------------------------------------------
# CMD ["python", "-m", "uvicorn", "server.main:app", "--host", "0.0.0.0", "--port", "8000"]
CMD ["gunicorn", "-c", "gunicorn.conf.py", "main:app"]
# Alternative:
# CMD ["gunicorn", "-c", "server/gunicorn.conf.py", "server.main:app"]
    
