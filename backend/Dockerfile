# # backend/Dockerfile

# # Use the official Python 3.10 slim image
# FROM python:3.10-slim

# # Set environment variables
# ENV PYTHONUNBUFFERED=1

# # Set the working directory inside the container
# WORKDIR /app

# # Copy the requirements file and install dependencies
# COPY requirements.txt /app/

# # Install system-level dependencies and Python packages
# RUN apt-get update && apt-get install -y --no-install-recommends \
#     build-essential \
#     libpq-dev && \
#     pip install --no-cache-dir -r requirements.txt && \
#     apt-get clean && rm -rf /var/lib/apt/lists/*

# # Copy the rest of the application code
# COPY . /app/

# # Create a non-root user
# RUN useradd -m myuser
# RUN chown -R myuser:myuser /app
# USER myuser

# # The command will be provided by docker-compose
# CMD ["gunicorn", "--config", "gunicorn.conf.py", "config.wsgi:application"]


# Use Python base image
FROM python:3.10-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Create app directory
WORKDIR /app

# Install dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy app source code
COPY . /app/

# Expose port
EXPOSE 8000

# Start Gunicorn server
CMD ["gunicorn", "--config", "gunicorn.conf.py", "config.wsgi:application"]
