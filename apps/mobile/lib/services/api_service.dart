import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  // TODO: Update with actual API URL
  final String baseUrl =
      const String.fromEnvironment('EXPRESS_API_URL', defaultValue: 'http://localhost:4000');
  final String internalKey =
      const String.fromEnvironment('INTERNAL_API_KEY', defaultValue: 'dev-internal-key');
  final String userId =
      const String.fromEnvironment('DEMO_USER_ID', defaultValue: 'demo-mobile-user');

  Future<String> chat(String message, String language) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/chat'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'message': message,
          'language': language,
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['data']['reply'] ?? 'No response';
      } else {
        throw Exception('Failed to get response');
      }
    } catch (e) {
      // Fallback for development when API is not running
      return language == 'bcl'
          ? 'Pasensya na, dai pa konektado an sistema.'
          : 'Pasensya, hindi pa konektado ang sistema.';
    }
  }

  Future<List<Map<String, dynamic>>> getFacilities() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/api/facilities'),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return List<Map<String, dynamic>>.from(data['data']);
      } else {
        throw Exception('Failed to get facilities');
      }
    } catch (e) {
      return [];
    }
  }

  // ---------------------------------------------------------------------------
  // Medication management (requires internal key + user id)
  // ---------------------------------------------------------------------------

  Map<String, String> _internalHeaders() => {
        'Content-Type': 'application/json',
        'X-Internal-Key': internalKey,
        'X-User-Id': userId,
      };

  Future<List<Map<String, dynamic>>> getMedicationCourses() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/api/medications/courses'),
        headers: _internalHeaders(),
      );
      final data = jsonDecode(response.body);
      if (response.statusCode == 200 && data['success'] == true) {
        return List<Map<String, dynamic>>.from(data['data'] ?? []);
      }
      return [];
    } catch (_) {
      return [];
    }
  }

  Future<List<Map<String, dynamic>>> getMedicationReminders() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/api/medications/reminders'),
        headers: _internalHeaders(),
      );
      final data = jsonDecode(response.body);
      if (response.statusCode == 200 && data['success'] == true) {
        return List<Map<String, dynamic>>.from(data['data'] ?? []);
      }
      return [];
    } catch (_) {
      return [];
    }
  }

  Future<void> upsertIntakeEvent({
    required String courseId,
    required String scheduledAtIso,
    required String status, // taken|missed|skipped
  }) async {
    await http.post(
      Uri.parse('$baseUrl/api/medications/intake'),
      headers: _internalHeaders(),
      body: jsonEncode({
        'courseId': courseId,
        'scheduledAt': scheduledAtIso,
        'status': status,
        'source': 'mobile',
      }),
    );
  }
}
