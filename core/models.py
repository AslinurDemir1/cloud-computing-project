from django.db import models

class HealthRecord(models.Model):
    # Patient Data
    age = models.PositiveIntegerField(verbose_name="Yaş")
    blood_pressure = models.CharField(max_length=15, verbose_name="Tansiyon (Örn: 12.8)")
    sugar_level = models.FloatField(verbose_name="Şeker Seviyesi")
    
    # Auto Calculated vs Fixed Data
    risk_score = models.CharField(max_length=50, blank=True, verbose_name="Risk Skoru")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Ölçüm Tarihi")

    def __str__(self):
        return f"Kayıt {self.id} | Yaş: {self.age} | Tansiyon: {self.blood_pressure} | Şeker: {self.sugar_level} | Risk: {self.risk_score}"

    class Meta:
        verbose_name = "Sağlık Kaydı"
        verbose_name_plural = "Sağlık Kayıtları"
        ordering = ['-created_at']
