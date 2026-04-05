from rest_framework import viewsets
from .models import HealthRecord
from .serializers import HealthRecordSerializer

class HealthRecordViewSet(viewsets.ModelViewSet):
    """
    Sağlık kayıtları için CRUD operasyonlarını sağlayan ViewSet.
    """
    queryset = HealthRecord.objects.all()
    serializer_class = HealthRecordSerializer

    def calculate_risk(self, data):
        """Çok Faktörlü Gelişmiş Sağlık Risk Analiz Motoru"""
        age = data.get('age')
        sugar = data.get('sugar_level')
        height = data.get('height')
        weight = data.get('weight')
        is_smoking = data.get('is_smoking')
        activity = data.get('activity_level')
        
        # BMI Hesaplama (View katmanında da lazım olabilir)
        height_m = height / 100
        bmi = weight / (height_m * height_m)
        
        score = 0
        reasons = []
        
        # Şeker Faktörü
        if sugar > 180: score += 40; reasons.append("Kritik Şeker")
        elif sugar > 120: score += 20; reasons.append("Yüksek Şeker")
        
        # BMI Faktörü
        if bmi > 30: score += 25; reasons.append("Obezite")
        elif bmi > 25: score += 10; reasons.append("Fazla Kilo")
        
        # Yaş & Sigara Faktörü
        if is_smoking == 'YES': score += 20; reasons.append("Sigara Kullanımı")
        if age > 60: score += 15; reasons.append("İleri Yaş")
        
        # Aktivite Faktörü (İndirici)
        if activity == 'HIGH': score -= 10
        elif activity == 'LOW': score += 10; reasons.append("Hareketsiz Yaşam")
        
        # Sonuç Belirleme
        if score >= 60: risk = "Kritik Risk 🚨"
        elif score >= 40: risk = "Yüksek Risk ⚠️"
        elif score >= 20: risk = "Orta Risk 🟡"
        else: risk = "Düşük Risk ✅"
        
        if reasons:
            risk += f" ({', '.join(reasons)})"
        
        return risk

    def perform_create(self, serializer):
        risk = self.calculate_risk(serializer.validated_data)
        serializer.save(risk_score=risk)

    def perform_update(self, serializer):
        risk = self.calculate_risk(serializer.validated_data)
        serializer.save(risk_score=risk)
