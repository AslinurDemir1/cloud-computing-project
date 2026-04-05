import os
import django
import random
from datetime import datetime, timedelta

# Django ortamını kur
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from core.models import HealthRecord

def seed_data():
    print("🚀 Veritabanı örnek verilerle dolduruluyor...")
    
    # 4 Farklı Profil
    patients = [
        {"name": "Aslı Demir", "age": 45, "height": 165, "weight": 68, "smoking": "NO", "activity": "MEDIUM"},
        {"name": "Mehmet Yılmaz", "age": 62, "height": 180, "weight": 95, "smoking": "YES", "activity": "LOW"},
        {"name": "Selin Kaya", "age": 28, "height": 170, "weight": 60, "smoking": "NO", "activity": "HIGH"},
        {"name": "Can Berk", "age": 50, "height": 175, "weight": 82, "smoking": "NO", "activity": "MEDIUM"}
    ]

    for p in patients:
        base_sugar = 100 if p["name"] == "Selin Kaya" else 180 if p["name"] == "Mehmet Yılmaz" else 135
        
        for i in range(10):
            # Geçmiş tarihlerle veri üret
            date = datetime.now() - timedelta(days=(10-i))
            sugar = base_sugar + random.randint(-15, 15)
            
            # Risk analizi burada tetiklenmezse bir sorun olmaz, 
            # ancak view tarafındaki algoritmayı buraya da kopyaladım ki görseller tam olsun.
            bmi = round(p["weight"] / ((p["height"]/100)**2), 1)
            
            score = 0
            if sugar > 180: score += 40
            if bmi > 30: score += 25
            if p["smoking"] == "YES": score += 20
            
            risk = "Düşük Risk ✅"
            if score >= 60: risk = "Kritik Risk 🚨"
            elif score >= 40: risk = "Yüksek Risk ⚠️"
            elif score >= 20: risk = "Orta Risk 🟡"

            HealthRecord.objects.create(
                patient_name=p["name"],
                age=p["age"],
                height=p["height"],
                weight=p["weight"] + random.uniform(-0.5, 1.5),
                bmi=bmi,
                blood_pressure=f"{random.randint(11,15)}.{random.randint(7,9)}",
                sugar_level=sugar,
                is_smoking=p["smoking"],
                activity_level=p["activity"],
                risk_score=risk,
                created_at=date
            )

    print("✅ Dashoard tüm verilerle hazır!")

if __name__ == '__main__':
    seed_data()
