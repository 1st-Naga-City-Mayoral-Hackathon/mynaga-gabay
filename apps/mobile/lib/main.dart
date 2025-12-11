import 'package:flutter/material.dart';
import 'package:mynaga_gabay/app/app_locator.dart';
import 'package:mynaga_gabay/app/view/app_page.dart';
import 'package:mynaga_gabay/bootstrap.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await localization.ensureInitialized();
  await AppLocator.init();

  bootstrap(() => const AppPage());
}
