# Python 3.11 tabanlı imaj kullan
FROM python:3.11-slim

# Çalışma dizinini ayarla
WORKDIR /app

# Sistem bağımlılıklarını yükle
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Bağımlılıkları kopyala ve yükle
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Proje dosyalarını kopyala
COPY . .

# Static dosyaları topla
RUN python manage.py collectstatic --noinput

# Gunicorn ile çalıştır (Port 8000)
# Gunicorn yüklemeyi unutma (pip install gunicorn)
RUN pip install gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "config.wsgi:application"]
