FROM python:3.11

RUN apt-get update && apt-get install -y \
    build-essential \
    libpango1.0-0 \
    libpangoft2-1.0-0 \
    libcairo2 \
    libgdk-pixbuf-2.0-0 \
    libffi-dev \
    libssl-dev \
    python3-dev \
    libxml2 \
    libxslt1-dev \
    libjpeg-dev \
    zlib1g-dev \
    fonts-liberation \
    libharfbuzz-dev \
    libfribidi-dev \
    shared-mime-info \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8080
ENV PORT=8080

CMD python generate_database.py && exec gunicorn --bind :$PORT --workers 1 --threads 8 --timeout 0 main:app