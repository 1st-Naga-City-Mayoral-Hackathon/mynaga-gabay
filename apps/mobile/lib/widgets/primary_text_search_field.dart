import 'package:flutter/material.dart';
import 'package:flutter_form_builder/flutter_form_builder.dart';
import 'package:mynaga_gabay/shared/color.dart';

class PrimaryTextSearchField extends StatefulWidget {
  const PrimaryTextSearchField({
    super.key,
    required this.name,
    required this.hintText,
  });

  final String name;
  final String hintText;

  @override
  State<PrimaryTextSearchField> createState() => _PrimaryTextSearchFieldState();
}

class _PrimaryTextSearchFieldState extends State<PrimaryTextSearchField> {
  @override
  Widget build(BuildContext context) {
    return FormBuilderTextField(
      name: widget.name,
      decoration: InputDecoration(
        hintText: widget.hintText,
        hintStyle: const TextStyle(
          color: AppColor.grey,
          fontWeight: FontWeight.w400,
        ),
        prefixIcon: const Icon(
          Icons.search,
          color: AppColor.grey,
          size: 20,
        ),
        suffixIcon: const Icon(Icons.search),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColor.border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColor.border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(
            color: AppColor.primary,
            width: 1.5,
          ),
        ),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 14,
        ),
        filled: false,
      ),
    );
  }
}
