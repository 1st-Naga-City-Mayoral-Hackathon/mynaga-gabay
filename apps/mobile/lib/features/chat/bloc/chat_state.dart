part of 'chat_bloc.dart';

enum ChatStatus {
  initial,
  loading,
  success,
  failed,
}

enum ChatMessageStatus {
  initial,
  sending,
  sent,
  failed,
}

class ChatState extends Equatable {
  final List<Message> messages;
  final ChatStatus status;
  final ChatMessageStatus messageStatus;
  final String error;

  const ChatState({
    this.messages = const [],
    this.status = ChatStatus.initial,
    this.messageStatus = ChatMessageStatus.initial,
    this.error = "",
  });

  ChatState copyWith({
    List<Message>? messages,
    ChatStatus? status,
    ChatMessageStatus? messageStatus,
    String? error,
  }) {
    return ChatState(
      messages: messages ?? this.messages,
      status: status ?? this.status,
      messageStatus: messageStatus ?? this.messageStatus,
      error: error ?? this.error,
    );
  }

  @override
  List<Object> get props => [
        messages,
        status,
        messageStatus,
        error,
      ];
}
