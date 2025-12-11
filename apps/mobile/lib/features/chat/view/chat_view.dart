import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_form_builder/flutter_form_builder.dart';
import 'package:flutter_localization/flutter_localization.dart';
import 'package:mynaga_gabay/app/app_locator.dart';
import 'package:mynaga_gabay/app/bloc/app_bloc.dart';
import 'package:mynaga_gabay/features/chat/bloc/chat_bloc.dart';
import 'package:mynaga_gabay/features/chat/data/model/message.dart';
import 'package:mynaga_gabay/localization/locales.dart';
import 'package:mynaga_gabay/shared/color.dart';
import 'package:mynaga_gabay/shared/images.dart';
import 'package:mynaga_gabay/widgets/chat_bubble.dart';
import 'package:mynaga_gabay/widgets/primary_text_field.dart';
import 'package:mynaga_gabay/widgets/voice_button.dart';

class ChatView extends StatefulWidget {
  const ChatView({super.key});

  @override
  State<ChatView> createState() => _ChatViewState();
}

class _ChatViewState extends State<ChatView> {
  @override
  void initState() {
    super.initState();
    init();
  }

  void init() {
    context.read<AppBloc>().add(AppLocaleChanged(
        localeCode: localization.currentLocale?.languageCode ?? 'en'));
    context.read<ChatBloc>().add(const ChatInitRequested());
  }

  final _formKey = GlobalKey<FormBuilderState>();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    String selectedFlag(String? localeCode) {
      switch (localeCode) {
        case 'en':
          return AppImages.americanFlag;
        case 'fil':
          return AppImages.philippinesFlag;
        case 'bcl':
          return AppImages.bicolFlag;
        default:
          return AppImages.philippinesFlag;
      }
    }

    const List<String> introMessages = [
      "Hanapin ang pinakamalapit na ospital",
      "Philhealth coverage",
      "Dosage ng Paracetamol",
    ];

    return BlocBuilder<AppBloc, AppState>(
      buildWhen: (previous, current) =>
          previous.localeCode != current.localeCode,
      builder: (context, state) {
        return BlocConsumer<ChatBloc, ChatState>(
          listenWhen: (prev, curr) => prev.messageStatus != curr.messageStatus,
          listener: (context, state) {
            if (state.messageStatus == ChatMessageStatus.sending) {
              _formKey.currentState?.reset();
            }
          },
          builder: (context, chatState) {
            return Scaffold(
              appBar: AppBar(
                leadingWidth: 70,
                leading: Padding(
                  padding: const EdgeInsets.only(left: 12.0),
                  child: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [AppColor.primary, AppColor.secondary],
                      ),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.local_hospital,
                        color: Colors.white, size: 20),
                  ),
                ),
                title: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      LocaleData.titleKey.getString(context),
                      style: theme.textTheme.bodyMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      LocaleData.subtitleKey.getString(context),
                      style: theme.textTheme.bodySmall,
                    ),
                  ],
                ),
                actions: [
                  // Theme toggle
                  // IconButton(
                  //   icon: Icon(
                  //     themeProvider.isDark ? Icons.light_mode : Icons.dark_mode,
                  //   ),
                  //   onPressed: () => themeProvider.toggleTheme(),
                  //   tooltip: themeProvider.isDark ? 'Light mode' : 'Dark mode',
                  // ),
                  // Language selector
                  PopupMenuButton<String>(
                    onSelected: (lang) {
                      context
                          .read<AppBloc>()
                          .add(AppLocaleChanged(localeCode: lang));
                    },
                    itemBuilder: (context) => [
                      _buildLanguageItem(
                        flag: AppImages.americanFlag,
                        name: 'English',
                        value: 'en',
                        isSelected: state.localeCode == 'en',
                      ),
                      _buildLanguageItem(
                        flag: AppImages.philippinesFlag,
                        name: 'Filipino',
                        value: 'fil',
                        isSelected: state.localeCode == 'fil',
                      ),
                      _buildLanguageItem(
                        flag: AppImages.bicolFlag,
                        name: 'Bikol',
                        value: 'bcl',
                        isSelected: state.localeCode == 'bcl',
                      ),
                    ],
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 8),
                      child: Row(
                        children: [
                          Image.asset(
                            selectedFlag(state.localeCode),
                            width: 24,
                            height: 24,
                          ),
                          const Icon(Icons.arrow_drop_down),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
              body: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  chatState.messages.isEmpty
                      ? Expanded(
                          child: Padding(
                            padding: const EdgeInsets.all(12.0),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              crossAxisAlignment: CrossAxisAlignment.center,
                              children: [
                                const Icon(Icons.circle, size: 48.0),
                                Text(
                                  LocaleData.chatGreetingKey.getString(context),
                                  style: theme.textTheme.bodyMedium?.copyWith(
                                    fontWeight: FontWeight.bold,
                                  ),
                                  textAlign: TextAlign.center,
                                ),
                                const SizedBox(height: 8.0),
                                Text(
                                    LocaleData.chatNoMessagesKey
                                        .getString(context),
                                    textAlign: TextAlign.center),
                                const SizedBox(height: 8.0),
                                Wrap(
                                  spacing: 12.0,
                                  runSpacing: 12.0,
                                  children: List.generate(
                                    introMessages.length,
                                    (index) => GestureDetector(
                                      onTap: () => context.read<ChatBloc>().add(
                                          ChatSendMessageRequested(
                                              message: introMessages[index])),
                                      child: Container(
                                        padding: const EdgeInsets.all(8.0),
                                        decoration: BoxDecoration(
                                          border: Border.all(
                                            color: AppColor.primary,
                                          ),
                                          borderRadius:
                                              BorderRadius.circular(12.0),
                                        ),
                                        child: Text(introMessages[index]),
                                      ),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        )
                      : Flexible(
                          child: ListView.builder(
                            itemCount: chatState.messages.length,
                            itemBuilder: (context, index) {
                              final message = chatState.messages[index];
                              return Padding(
                                padding: const EdgeInsets.all(12.0),
                                child: ChatBubble(
                                  text: message.message,
                                  isUser: message.role == MessageRole.user,
                                ),
                              );
                            },
                          ),
                        ),
                  if (chatState.messageStatus == ChatMessageStatus.sending)
                    Padding(
                      padding: const EdgeInsets.all(16),
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
                            LocaleData.chatTypingKey.getString(context),
                            style: theme.textTheme.bodySmall,
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
                          color: Colors.black.withValues(alpha: 0.3),
                          blurRadius: 8,
                          offset: const Offset(0, -2),
                        ),
                      ],
                    ),
                    child: SafeArea(
                      top: false,
                      child: FormBuilder(
                        key: _formKey,
                        onChanged: () => _formKey.currentState?.save(),
                        child: Row(
                          children: [
                            VoiceButton(
                              onTranscript: (value) {},
                              language: state.localeCode ?? 'en',
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: PrimaryTextField(
                                name: 'message',
                                hintText: LocaleData.chatPlaceholderKey
                                    .getString(context),
                              ),
                            ),
                            const SizedBox(width: 8),
                            IconButton(
                              onPressed: () {
                                final message = _formKey
                                    .currentState?.fields['message']?.value;
                                if (message != null) {
                                  context.read<ChatBloc>().add(
                                      ChatSendMessageRequested(
                                          message: message));
                                }
                              },
                              icon: const Icon(Icons.send),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  PopupMenuItem<String> _buildLanguageItem({
    required String flag,
    required String name,
    required String value,
    required bool isSelected,
  }) {
    return PopupMenuItem(
      value: value,
      child: Row(
        children: [
          Image.asset(flag, width: 24, height: 24),
          const SizedBox(width: 8),
          Text(
            name,
            style: TextStyle(
              fontWeight: isSelected ? FontWeight.bold : null,
            ),
          ),
          if (isSelected) ...[
            const Spacer(),
            const Icon(Icons.check, size: 18),
          ],
        ],
      ),
    );
  }
}
