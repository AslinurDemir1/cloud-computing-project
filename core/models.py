from django.db import models

class HealthRecord(models.Model):
    # Patient Data
    patient_name = models.CharField(max_length=100, verbose_name="Hasta Adı", default="İsimsiz Hasta")
    age = models.PositiveIntegerField(verbose_name="Yaş")
    height = models.FloatField(verbose_name="Boy (cm)", default=170)
    weight = models.FloatField(verbose_name="Kilo (kg)", default=70)
    bmi = models.FloatField(verbose_name="VKE (BMI)", blank=True, null=True)
    
    blood_pressure = models.CharField(max_length=15, verbose_name="Tansiyon (Örn: 12.8)")
    sugar_level = models.FloatField(verbose_name="Şeker Seviyesi")
    
    # Lifestyle Data
    SMOKING_CHOICES = [('YES', 'Evet'), ('NO', 'Hayır')]
    is_smoking = models.CharField(max_length=3, choices=SMOKING_CHOICES, default='NO')
    
    ACTIVITY_LEVELS = [
        ('LOW', 'Hareketsiz'),
        ('MEDIUM', 'Orta Derece Aktif'),
        ('HIGH', 'Çok Aktif')
    ]
    activity_level = models.CharField(max_length=10, choices=ACTIVITY_LEVELS, default='MEDIUM')
    
    # Analysis Data
    risk_score = models.CharField(max_length=100, blank=True, verbose_name="Risk Analiz Skoru")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Ölçüm Tarihi")

    def save(self, *args, **kwargs):
        # BMI Hesaplama (Kilo / Boy^2)
        if self.height and self.weight:
            height_m = self.height / 100
            self.bmi = round(self.weight / (height_m * height_m), 1)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.patient_name} | Yaş: {self.age} | BMI: {self.bmi}"

    class Meta:
        verbose_name = "Kapsamlı Sağlık Kaydı"
        verbose_name_plural = "Kapsamlı Sağlık Kayıtları"
        ordering = ['-created_at']
