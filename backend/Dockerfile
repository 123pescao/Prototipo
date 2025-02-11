# Use official Python image (slim variant for smaller size)
FROM python:3.11-slim

# Set the working directory inside the container
WORKDIR /app

# Copy only requirements first (helps with Docker caching)
COPY requirements.txt ./

# Install dependencies (reduce image size & improve performance)
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend code
COPY . .

# Expose Flask default port
EXPOSE 5000

# Define environment variables
ENV FLASK_APP=main.py
ENV FLASK_RUN_HOST=0.0.0.0

# Start the Flask app with Gunicorn for production
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "main:app"]
