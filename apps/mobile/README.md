# MyNaga Gabay Mobile

Flutter mobile app for the MyNaga Gabay health assistant.

## Getting Started

1. Install Flutter: https://flutter.dev/docs/get-started/install

2. Install dependencies:
```bash
flutter pub get
```

3. Run on device/emulator:
```bash
flutter run
```

## Features
- Voice input using speech_to_text
- Chat interface with Gabay AI
- Language selection (Filipino, Bikol, English)
- Camera integration for prescription scanning (TODO)

## Configuration

Update the API URL in `lib/services/api_service.dart` for production:
```dart
final String baseUrl = 'https://your-api-url.com';
```
