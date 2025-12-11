part of 'chat_bloc.dart';

class ChatEvent extends Equatable {
  const ChatEvent();

  @override
  List<Object> get props => [];
}

class ChatInitRequested extends ChatEvent {
  const ChatInitRequested();
}

class ChatSendMessageRequested extends ChatEvent {
  final String message;
  const ChatSendMessageRequested({required this.message});
}
