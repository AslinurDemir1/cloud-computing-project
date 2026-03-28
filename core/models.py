from django.db import models

class Project(models.Model):
    STATUS_CHOICES = [
        ('Devam Ediyor', 'Devam Ediyor'),
        ('Tamamlandı', 'Tamamlandı'),
    ]
    
    name = models.CharField(max_length=255, verbose_name="Proje Adı")
    description = models.TextField(verbose_name="Açıklama", blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Oluşturulma Tarihi")
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='Devam Ediyor',
        verbose_name="Durum"
    )

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Proje"
        verbose_name_plural = "Projeler"
        ordering = ['-created_at']
