# Use official Python image
FROM python:3.11-slim

# Set working directory inside container
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    curl \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

# Copy only requirements first (to leverage Docker layer caching)
COPY requirements.txt ./

# Copy rest of backend code
COPY . .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose Flask default port
EXPOSE 5000

# Set environment variables for Flask
ENV FLASK_APP=main:app
ENV FLASK_RUN_HOST=0.0.0.0

# Ensure database migrations are applied before running Gunicorn
RUN flask db upgrade || true  # Avoid errors if migrations don't exist

# Start Gunicorn with error logging
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "main:create_app()", "--log-level=debug"]