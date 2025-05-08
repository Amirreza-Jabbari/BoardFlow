from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    # Admin site
    path('admin/', admin.site.urls),

    # All API routes live under /api/
    path('api/', include('boards.urls')),
]
