import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:mynaga_gabay/features/chat/data/model/message.dart';
import 'package:uuid/uuid.dart';

part 'chat_event.dart';
part 'chat_state.dart';

class ChatBloc extends Bloc<ChatEvent, ChatState> {
  ChatBloc() : super(const ChatState()) {
    on<ChatInitRequested>(_onInitRequested);
    on<ChatSendMessageRequested>(_onSendMessageRequested);
  }

  void _onInitRequested(ChatInitRequested event, Emitter<ChatState> emit) {
    emit(state.copyWith(status: ChatStatus.loading));
    try {
      emit(state.copyWith(messages: Message.messages));
    } catch (e) {
      emit(state.copyWith(status: ChatStatus.failed, error: e.toString()));
    }
  }

  void _onSendMessageRequested(
      ChatSendMessageRequested event, Emitter<ChatState> emit) async {
    emit(state.copyWith(messageStatus: ChatMessageStatus.sending));
    try {
      final newMessage = Message(
          id: const Uuid().v1(),
          message: event.message,
          role: MessageRole.user);

      await Future.delayed(const Duration(seconds: 2), () {
        emit(state.copyWith(
            messages: [...state.messages, newMessage],
            messageStatus: ChatMessageStatus.sent));
      });
    } catch (e) {
      emit(state.copyWith(
          messageStatus: ChatMessageStatus.failed, error: e.toString()));
    }
  }
}
