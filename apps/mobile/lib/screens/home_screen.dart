import 'package:flutter/material.dart';
import '../widgets/chat_bubble.dart';
import '../widgets/voice_button.dart';
import '../services/api_service.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final TextEditingController _messageController = TextEditingController();
  final List<Map<String, dynamic>> _messages = [];
  final ApiService _apiService = ApiService();
  bool _isLoading = false;
  String _selectedLanguage = 'fil';

  final Map<String, String> _greetings = {
    'en': 'Hello! I am Gabay, your health assistant.',
    'fil': 'Kamusta! Ako si Gabay, ang iyong katulong sa kalusugan.',
    'bcl': 'Kumusta! Ako si Gabay, an saimong katabang sa salud.',
  };

  @override
  void initState() {
    super.initState();
    // Add initial greeting
    _messages.add({
      'role': 'assistant',
      'content': _greetings[_selectedLanguage],
    });
  }

  Future<void> _sendMessage(String text) async {
    if (text.trim().isEmpty) return;

    setState(() {
      _messages.add({'role': 'user', 'content': text});
      _isLoading = true;
    });
    _messageController.clear();

    try {
      final response = await _apiService.chat(text, _selectedLanguage);
      setState(() {
        _messages.add({'role': 'assistant', 'content': response});
      });
    } catch (e) {
      setState(() {
        _messages.add({
          'role': 'assistant',
          'content': 'Pasensya, may problema sa koneksyon. Subukan muli.',
        });
      });
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Row(
          children: [
            Icon(Icons.local_hospital, color: Color(0xFF0D9488)),
            SizedBox(width: 8),
            Text('MyNaga Gabay'),
          ],
        ),
        actions: [
          PopupMenuButton<String>(
            onSelected: (lang) {
              setState(() => _selectedLanguage = lang);
            },
            itemBuilder: (context) => [
              const PopupMenuItem(value: 'en', child: Text('English')),
              const PopupMenuItem(value: 'fil', child: Text('Filipino')),
              const PopupMenuItem(value: 'bcl', child: Text('Bikol')),
            ],
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                children: [
                  Text(_selectedLanguage.toUpperCase()),
                  const Icon(Icons.arrow_drop_down),
                ],
              ),
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final message = _messages[index];
                return ChatBubble(
                  text: message['content'],
                  isUser: message['role'] == 'user',
                );
              },
            ),
          ),
          if (_isLoading)
            const Padding(
              padding: EdgeInsets.all(8),
              child: CircularProgressIndicator(),
            ),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.surface,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.1),
                  blurRadius: 8,
                  offset: const Offset(0, -2),
                ),
              ],
            ),
            child: Row(
              children: [
                VoiceButton(
                  onTranscript: _sendMessage,
                  language: _selectedLanguage,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: TextField(
                    controller: _messageController,
                    decoration: InputDecoration(
                      hintText: _selectedLanguage == 'bcl'
                          ? 'Mag-type digdi...'
                          : 'Mag-type dito...',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(24),
                      ),
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 12,
                      ),
                    ),
                    onSubmitted: _sendMessage,
                  ),
                ),
                const SizedBox(width: 8),
                IconButton.filled(
                  onPressed: () => _sendMessage(_messageController.text),
                  icon: const Icon(Icons.send),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _messageController.dispose();
    super.dispose();
  }
}
