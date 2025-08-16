from django.core.management.base import BaseCommand
from rest_framework_api_key.models import APIKey
from django.utils import timezone


class Command(BaseCommand):
    help = 'List all existing bot API keys'

    def handle(self, *args, **options):
        queryset = APIKey.objects.all()
        
        self.stdout.write(self.style.SUCCESS('All Bot API Keys:'))

        if not queryset.exists():
            self.stdout.write(self.style.WARNING('No API keys found.'))
            return

        self.stdout.write('-' * 80)
        for api_key in queryset.order_by('-created'):
            status_indicator = '🟢 Active' if not api_key.revoked else '🔴 Revoked'
            expired_status = ' (Expired)' if api_key.has_expired else ''
            
            self.stdout.write(f'ID: {api_key.id}')
            self.stdout.write(f'Name: {api_key.name}')
            self.stdout.write(f'Status: {status_indicator}{expired_status}')
            self.stdout.write(f'Created: {api_key.created}')
            if api_key.expiry_date:
                self.stdout.write(f'Expires: {api_key.expiry_date}')
            else:
                self.stdout.write('Expires: Never')
            self.stdout.write(f'Hashed Key: {api_key.hashed_key[:20]}...')
            self.stdout.write('-' * 80)

        total_count = queryset.count()
        active_count = queryset.filter(revoked=False).count()
        self.stdout.write(f'\nTotal: {total_count} API keys ({active_count} active)')
