from django.apps import AppConfig


class BryoConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'bryo'

    def ready(self):
        import bryo.models  # noqa: F401 — ensures signals are registered
