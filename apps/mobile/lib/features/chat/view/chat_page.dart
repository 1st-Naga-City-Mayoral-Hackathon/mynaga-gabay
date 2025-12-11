import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mynaga_gabay/app/app_locator.dart';
import 'package:mynaga_gabay/app/bloc/app_bloc.dart';
import 'package:mynaga_gabay/features/chat/bloc/chat_bloc.dart';
import 'package:mynaga_gabay/features/chat/view/chat_view.dart';

class ChatPage extends StatelessWidget {
  static const String route = "chat_route";
  const ChatPage({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider.value(
          value: getIt<AppBloc>(),
        ),
        BlocProvider.value(
          value: getIt<ChatBloc>(),
        ),
      ],
      child: const ChatView(),
    );
  }
}
