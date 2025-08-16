from django.core.management.base import BaseCommand
from rest_framework_api_key.models import APIKey


class Command(BaseCommand):
    help = 'Create a new API key for bot access'

    def add_arguments(self, parser):
        parser.add_argument(
            '--bot-name',
            type=str,
            required=True,
            help='Name of the bot that will use this API key'
        )
        parser.add_argument(
            '--description',
            type=str,
            default='',
            help='Description of what this bot does'
        )

    def handle(self, *args, **options):
        bot_name = options['bot_name']
        description = options['description']
        
        # Use bot_name as the key name
        key_name = f"{bot_name} API Key"

        # Check if API key with this name already exists
        existing_key = APIKey.objects.filter(name=key_name).first()
        if existing_key:
            self.stdout.write(
                self.style.WARNING(
                    f'An API key named "{key_name}" already exists. '
                    f'Consider using a different bot name.'
                )
            )
            return

        # Create the API key
        try:
            api_key, key = APIKey.objects.create_key(name=key_name)
            
            self.stdout.write(
                self.style.SUCCESS(f'Successfully created API key for bot: {bot_name}')
            )
            self.stdout.write(f'API Key ID: {api_key.id}')
            self.stdout.write(f'Key Name: {api_key.name}')
            self.stdout.write(self.style.WARNING(f'API Key: {key}'))
            self.stdout.write(
                self.style.WARNING(
                    '\n⚠️  IMPORTANT: This is the only time you will see the API key. '
                    'Save it securely now!\n'
                )
            )
            self.stdout.write('Use this key in the "x-api-key" header when making requests to the bot API.')
            self.stdout.write(f'Description: {description}')
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error creating API key: {str(e)}')
            )
