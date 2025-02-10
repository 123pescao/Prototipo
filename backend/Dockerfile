# Use official Python image
FROM python:3.11

# Set the working directory
WORKDIR /app

# Copy all files to container
COPY . .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose Flask default port
EXPOSE 5000

# Start the Flask app
CMD ["flask", "run", "--host=0.0.0.0"]
