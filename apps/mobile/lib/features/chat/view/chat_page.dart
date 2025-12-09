import 'package:flutter/material.dart';
import 'package:mynaga_gabay/features/chat/view/chat_view.dart';

class ChatPage extends StatelessWidget {
  static const String route = "chat_route";
  const ChatPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const ChatView();
  }
}
