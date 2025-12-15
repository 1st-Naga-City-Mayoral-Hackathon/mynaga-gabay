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
                  padding: const EdgeInsets.only(left: 16.0),
                  child: Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: AppColor.border, width: 1),
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(20),
                      child: Image.asset(
                        AppImages.likhaIcon,
                        width: 40,
                        height: 40,
                        fit: BoxFit.cover,
                      ),
                    ),
                  ),
                ),
                title: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      LocaleData.titleKey.getString(context),
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    Text(
                      LocaleData.subtitleKey.getString(context),
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: AppColor.grey,
                      ),
                    ),
                  ],
                ),
                elevation: 0,
                actions: [
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
                    icon: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        border: Border.all(color: AppColor.border),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Image.asset(
                            selectedFlag(state.localeCode),
                            width: 20,
                            height: 20,
                          ),
                          const SizedBox(width: 4),
                          const Icon(Icons.arrow_drop_down, size: 18),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                ],
              ),
              body: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  chatState.messages.isEmpty
                      ? Expanded(
                          child: Padding(
                            padding: const EdgeInsets.all(24.0),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              crossAxisAlignment: CrossAxisAlignment.center,
                              children: [
                                Container(
                                  width: 80,
                                  height: 80,
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    border: Border.all(
                                      color: AppColor.primary,
                                      width: 2,
                                    ),
                                  ),
                                  child: const Icon(
                                    Icons.chat_bubble_outline,
                                    size: 40,
                                    color: AppColor.primary,
                                  ),
                                ),
                                const SizedBox(height: 24),
                                Text(
                                  LocaleData.chatGreetingKey.getString(context),
                                  style: theme.textTheme.titleLarge?.copyWith(
                                    fontWeight: FontWeight.w600,
                                  ),
                                  textAlign: TextAlign.center,
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  LocaleData.chatNoMessagesKey
                                      .getString(context),
                                  style: theme.textTheme.bodyMedium?.copyWith(
                                    color: AppColor.grey,
                                  ),
                                  textAlign: TextAlign.center,
                                ),
                                const SizedBox(height: 32),
                                Wrap(
                                  spacing: 8,
                                  runSpacing: 8,
                                  alignment: WrapAlignment.center,
                                  children: List.generate(
                                    introMessages.length,
                                    (index) => InkWell(
                                      onTap: () => context.read<ChatBloc>().add(
                                          ChatSendMessageRequested(
                                              message: introMessages[index])),
                                      borderRadius: BorderRadius.circular(8),
                                      child: Container(
                                        padding: const EdgeInsets.symmetric(
                                          horizontal: 16,
                                          vertical: 10,
                                        ),
                                        decoration: BoxDecoration(
                                          border: Border.all(
                                            color: AppColor.border,
                                          ),
                                          borderRadius:
                                              BorderRadius.circular(8),
                                        ),
                                        child: Text(
                                          introMessages[index],
                                          style: theme.textTheme.bodySmall,
                                        ),
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
                      padding: const EdgeInsets.symmetric(
                        horizontal: 24,
                        vertical: 16,
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: AppColor.primary,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Text(
                            LocaleData.chatTypingKey.getString(context),
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: AppColor.grey,
                            ),
                          ),
                        ],
                      ),
                    ),
                  Container(
                    decoration: BoxDecoration(
                      color: theme.scaffoldBackgroundColor,
                      border: Border(
                        top: BorderSide(
                          color: AppColor.border.withValues(alpha: 0.5),
                          width: 1,
                        ),
                      ),
                    ),
                    child: SafeArea(
                      top: false,
                      child: Padding(
                        padding: const EdgeInsets.all(16),
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
                              Container(
                                decoration: BoxDecoration(
                                  color: AppColor.primary,
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: IconButton(
                                  onPressed: () {
                                    final message = _formKey
                                        .currentState?.fields['message']?.value;
                                    if (message != null && message.isNotEmpty) {
                                      context.read<ChatBloc>().add(
                                          ChatSendMessageRequested(
                                              message: message));
                                    }
                                  },
                                  icon: const Icon(
                                    Icons.send,
                                    color: Colors.white,
                                    size: 20,
                                  ),
                                ),
                              ),
                            ],
                          ),
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
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 4),
        child: Row(
          children: [
            Image.asset(flag, width: 20, height: 20),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                name,
                style: TextStyle(
                  fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                  color: isSelected ? AppColor.primary : null,
                ),
              ),
            ),
            if (isSelected)
              const Icon(
                Icons.check_circle,
                size: 18,
                color: AppColor.primary,
              ),
          ],
        ),
      ),
    );
  }
}
