from rest_framework import viewsets
from .models import Project
from .serializers import ProjectSerializer

class ProjectViewSet(viewsets.ModelViewSet):
    """
    Project modeli için tüm CRUD (Ekle, Listele, Güncelle, Sil) operasyonlarını destekleyen ViewSet.
    """
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
