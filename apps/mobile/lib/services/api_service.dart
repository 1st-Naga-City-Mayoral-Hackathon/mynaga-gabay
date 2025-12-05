import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  // TODO: Update with actual API URL
  final String baseUrl = 'http://localhost:4000';

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
}
