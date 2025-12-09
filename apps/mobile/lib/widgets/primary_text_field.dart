import 'package:flutter/material.dart';
import 'package:flutter_form_builder/flutter_form_builder.dart';

class PrimaryTextField extends StatelessWidget {
  const PrimaryTextField({
    super.key,
    required this.name,
    required this.hintText,
  });

  final String name;
  final String hintText;

  @override
  Widget build(BuildContext context) {
    return FormBuilderTextField(
      name: name,
      decoration: InputDecoration(
        hintText: hintText,
      ),
    );
  }
}
