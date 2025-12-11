import 'package:json_annotation/json_annotation.dart';

part 'message.g.dart';

enum MessageRole {
  @JsonValue("user")
  user,
  @JsonValue("assistant")
  assistant,
}

@JsonSerializable(explicitToJson: true)
class Message {
  final String id;
  final String message;
  final MessageRole role;

  Message({
    required this.id,
    required this.message,
    required this.role,
  });

  factory Message.fromJson(Map<String, dynamic> json) =>
      _$MessageFromJson(json);
  Map<String, dynamic> toJson() => _$MessageToJson(this);

  static List<Message> messages = [
    Message(
        id: '1', message: 'Hello, how are you?', role: MessageRole.assistant),
    Message(id: '2', message: 'I am fine, thank you!', role: MessageRole.user),
  ];
}
