# 🏥 Cloud-Based Health Analysis System

## 🚀 Proje Hakkında (Bulut Bilişim Dersi Proje 1)
Bu proje, **Çift Katmanlı Web Uygulaması (Web API + Frontend)** mimarisiyle geliştirilmiş bulut tabanlı bir sağlık veri yönetim sistemidir. Sistem, kullanıcıların sağlık verilerini (yaş, şeker seviyesi, tansiyon) kaydetmesine, tarihsel verileri görselleştirmesine ve anlık olarak yapay bir tıbbi risk skoru elde etmesine olanak tanır.

### 🏗 Mimari Şema
- **Backend (Python/Django REST Framework)**: Veri yönetimi, risk analizi algoritması ve JWT tabanlı güvenlik sağlar.
- **Frontend (React/Vite/Highcharts)**: Modern, hızlı ve mobil uyumlu bir arayüz ile veri görselleştirmesi sunar.
- **Güvenlik**: API uç noktaları JWT (JSON Web Token) ile korunmaktadır.
- **Altyapı (Cloud Ready)**: Dockerize edilmiştir ve AWS (EC2, S3, RDS) gibi bulut platformlarına dağıtıma uygundur.

---

## 🛠 Kullanılan Teknolojiler

### Backend
- **Dil/Framework**: Python 3.11, Django 5.x, Django REST Framework
- **Güvenlik**: SimpleJWT (Auth), CORS Middleware
- **Veritabanı**: SQLite (Geliştirme), PostgreSQL/RDS (Üretim)
- **API Dokümantasyonu**: drf-spectacular (Swagger UI)

### Frontend
- **Framework**: React 19 (Vite)
- **Stil/UI**: Tailwind CSS 4.x
- **Grafik**: Highcharts
- **API İletişimi**: Axios

---

## 📦 Kurulum ve Çalıştırma

### 1. Lokal (Manuel) Kurulum

**Backend:**
```bash
# Bağımlılıkları yükle
pip install -r requirements.txt

# Veritabanını hazırla
python manage.py migrate

# Sunucuyu başlat
python manage.py runserver
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### 2. Docker ile Çalıştırma (Cloud Ready)
```bash
docker-compose up --build
```
Bu komut ile backend `8000` portundan, frontend `80` portundan yayına geçer.

---

## ☁️ Bulut (AWS) Dağıtım Kılavuzu

Projeyi AWS üzerinde barındırmak için şu adımları takip edebilirsiniz:

1.  **EC2 (Backend)**: Bir t2.micro (veya benzeri) instance oluşturun. Docker ve Docker Compose kurun.
2.  **RDS (Veritabanı)**: PostgreSQL veritabanı oluşturun ve `settings.py` içinden bağlantı verilerini güncelleyin.
3.  **S3 / CloudFront (Frontend)**: `npm run build` çıktısını S3 bucket'ına yükleyin ve statik web hosting özelliğini aktif edin.
4.  **Güvenlik Grupları**: `8000` (API) ve `80` (HTTP) portlarını dış erişime açın.

---

## 🔐 API Güvenliği (JWT)
Uygulama artık güvenli bir katmana sahiptir.
- **Token Al**: `POST /api/token/` (Username/Password ile)
- **Kayıtları Görüntüle**: Authorization header'da `Bearer <token>` gereklidir.

---

## 📊 Video Sunumu
PDF gereksinimlerine göre hazırlanan 10 dakikalık teknik sunuma şu linkten ulaşabilirsiniz:
[[Buraya Video Linki Gelecek](https://drive.google.com/file/d/1vd2jde8j0fXTv3P7KxJD0sWM3mBYhxig/view?usp=sharing)]

## 📝 Hazırlayan
Aslınur Demir - Bulut Bilişim Dersi (3522)
