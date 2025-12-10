import 'package:flutter/material.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;

class VoiceButton extends StatefulWidget {
  final Function(String) onTranscript;
  final String language;

  const VoiceButton({
    super.key,
    required this.onTranscript,
    required this.language,
  });

  @override
  State<VoiceButton> createState() => _VoiceButtonState();
}

class _VoiceButtonState extends State<VoiceButton> {
  final stt.SpeechToText _speech = stt.SpeechToText();
  bool _isListening = false;

  @override
  void dispose() {
    _speech.stop();
    super.dispose();
  }

  String get _localeId {
    switch (widget.language) {
      case 'en':
        return 'en_US';
      case 'fil':
      case 'bcl': // Bikol uses Filipino locale as closest match
        return 'fil_PH';
      default:
        return 'fil_PH';
    }
  }

  Future<void> _startListening() async {
    bool available = await _speech.initialize();
    if (available) {
      setState(() => _isListening = true);
      await _speech.listen(
        onResult: (result) {
          if (result.finalResult) {
            widget.onTranscript(result.recognizedWords);
            _stopListening();
          }
        },
        localeId: _localeId,
      );
    }
  }

  void _stopListening() {
    _speech.stop();
    setState(() => _isListening = false);
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => _startListening(),
      onTapUp: (_) => _stopListening(),
      onTapCancel: _stopListening,
      child: Container(
        width: 48,
        height: 48,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: _isListening
              ? Colors.red
              : Theme.of(context).colorScheme.primaryContainer,
        ),
        child: Icon(
          Icons.mic,
          color: _isListening
              ? Colors.white
              : Theme.of(context).colorScheme.onPrimaryContainer,
        ),
      ),
    );
  }
}
