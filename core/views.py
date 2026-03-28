from rest_framework import viewsets
from .models import HealthRecord
from .serializers import HealthRecordSerializer

class HealthRecordViewSet(viewsets.ModelViewSet):
    """
    Sağlık kayıtları için CRUD operasyonlarını sağlayan ViewSet.
    """
    queryset = HealthRecord.objects.all()
    serializer_class = HealthRecordSerializer

    def calculate_risk(self, age, sugar_level):
        """Basit bir Tıbbi Risk Algoritması Simülasyonu"""
        risk_score = "Düşük Risk"
        
        if sugar_level > 200:
            risk_score = "Yüksek Risk (Aşırı Şeker)"
        elif sugar_level > 140:
            risk_score = "Orta Risk"
        elif sugar_level < 70:
            risk_score = "Yüksek Risk (Hipoglisemi)"
            
        if age > 65 and risk_score == "Orta Risk":
            risk_score = "Yüksek Risk (İleri Yaş + Orta Şeker)"
            
        return risk_score

    def perform_create(self, serializer):
        data = serializer.validated_data
        sugar_level = data.get('sugar_level')
        age = data.get('age')
        
        risk_score = self.calculate_risk(age, sugar_level)
        
        # risk_score'u veritabanına otomatik enjekte et
        serializer.save(risk_score=risk_score)

    def perform_update(self, serializer):
        data = serializer.validated_data
        sugar_level = data.get('sugar_level', serializer.instance.sugar_level)
        age = data.get('age', serializer.instance.age)
        
        risk_score = self.calculate_risk(age, sugar_level)
        
        serializer.save(risk_score=risk_score)
