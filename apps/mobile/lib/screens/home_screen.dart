import 'package:flutter/material.dart';
import 'package:mynaga_gabay/shared/color.dart';
import 'package:provider/provider.dart';
import '../widgets/chat_bubble.dart';
import '../widgets/voice_button.dart';
import '../services/api_service.dart';
import '../providers/language_provider.dart';
import '../providers/theme_provider.dart';
import 'settings_screen.dart';

class HomeScreen extends StatefulWidget {
  static String route = '/';
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final TextEditingController _messageController = TextEditingController();
  final List<Map<String, dynamic>> _messages = [];
  final ApiService _apiService = ApiService();
  final ScrollController _scrollController = ScrollController();
  bool _isLoading = false;
  bool _initialized = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_initialized) {
      final langProvider =
          Provider.of<LanguageProvider>(context, listen: false);
      _messages.add({
        'role': 'assistant',
        'content': langProvider.t('chat.greeting'),
      });
      _initialized = true;
    }
  }

  Future<void> _sendMessage(String text) async {
    if (text.trim().isEmpty) return;

    final langProvider = Provider.of<LanguageProvider>(context, listen: false);

    setState(() {
      _messages.add({'role': 'user', 'content': text});
      _isLoading = true;
    });
    _messageController.clear();
    _scrollToBottom();

    try {
      final response = await _apiService.chat(text, langProvider.languageCode);
      setState(() {
        _messages.add({'role': 'assistant', 'content': response});
      });
    } catch (e) {
      setState(() {
        _messages.add({
          'role': 'assistant',
          'content': langProvider.t('chat.error'),
        });
      });
    } finally {
      setState(() => _isLoading = false);
      _scrollToBottom();
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final langProvider = Provider.of<LanguageProvider>(context);
    final themeProvider = Provider.of<ThemeProvider>(context);
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                // gradient: const LinearGradient(
                // colors: [AppColor.primary, AppColor.secondary],
                // ),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(Icons.local_hospital,
                  color: Colors.white, size: 20),
            ),
            const SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  langProvider.t('app.title'),
                  style: const TextStyle(
                      fontWeight: FontWeight.bold, fontSize: 16),
                ),
                Text(
                  langProvider.t('app.subtitle'),
                  style: TextStyle(
                    fontSize: 11,
                    color: theme.colorScheme.onSurface.withOpacity(0.6),
                  ),
                ),
              ],
            ),
          ],
        ),
        actions: [
          // Theme toggle
          IconButton(
            icon: Icon(
              themeProvider.isDark ? Icons.light_mode : Icons.dark_mode,
            ),
            onPressed: () => themeProvider.toggleTheme(),
            tooltip: themeProvider.isDark ? 'Light mode' : 'Dark mode',
          ),
          // Language selector
          PopupMenuButton<AppLanguage>(
            onSelected: (lang) => langProvider.setLanguage(lang),
            itemBuilder: (context) => [
              _buildLanguageItem(
                  AppLanguage.en, '🇺🇸', 'English', langProvider),
              _buildLanguageItem(
                  AppLanguage.fil, '🇵🇭', 'Filipino', langProvider),
              _buildLanguageItem(AppLanguage.bcl, '🏝️', 'Bikol', langProvider),
            ],
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8),
              child: Row(
                children: [
                  Text(langProvider.languageFlag,
                      style: const TextStyle(fontSize: 18)),
                  const Icon(Icons.arrow_drop_down),
                ],
              ),
            ),
          ),
          // Settings
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const SettingsScreen()),
              );
            },
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
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
            Padding(
              padding: const EdgeInsets.all(8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  SizedBox(
                    width: 16,
                    height: 16,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: theme.colorScheme.primary,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    'Gabay is typing...',
                    style: TextStyle(
                      color: theme.colorScheme.onSurface.withOpacity(0.6),
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: theme.colorScheme.surface,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.1),
                  blurRadius: 8,
                  offset: const Offset(0, -2),
                ),
              ],
            ),
            child: SafeArea(
              top: false,
              child: Row(
                children: [
                  VoiceButton(
                    onTranscript: _sendMessage,
                    language: langProvider.languageCode,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: TextField(
                      controller: _messageController,
                      decoration: InputDecoration(
                        hintText: langProvider.t('chat.placeholder'),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(24),
                        ),
                        contentPadding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 12,
                        ),
                        filled: true,
                        fillColor: theme.colorScheme.surfaceContainerHighest
                            .withOpacity(0.5),
                      ),
                      onSubmitted: _sendMessage,
                    ),
                  ),
                  const SizedBox(width: 8),
                  FloatingActionButton.small(
                    onPressed: () => _sendMessage(_messageController.text),
                    child: const Icon(Icons.send),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  PopupMenuItem<AppLanguage> _buildLanguageItem(
    AppLanguage lang,
    String flag,
    String name,
    LanguageProvider provider,
  ) {
    final isSelected = provider.language == lang;
    return PopupMenuItem(
      value: lang,
      child: Row(
        children: [
          Text(flag, style: const TextStyle(fontSize: 18)),
          const SizedBox(width: 8),
          Text(
            name,
            style: TextStyle(
              fontWeight: isSelected ? FontWeight.bold : null,
            ),
          ),
          if (isSelected) ...[
            const Spacer(),
            Icon(Icons.check,
                size: 18, color: Theme.of(context).colorScheme.primary),
          ],
        ],
      ),
    );
  }

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }
}
