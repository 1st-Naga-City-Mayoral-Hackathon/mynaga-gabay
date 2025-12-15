import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:mynaga_gabay/features/layout/view/layout_view.dart';
import 'package:mynaga_gabay/shared/images.dart';

enum LayoutPageTab {
  facility(
      title: "Facility",
      icon: AppImages.facilityOutlined,
      selectedIcon: AppImages.facilityFilled),
  medicine(
      title: "Medicine",
      icon: AppImages.medicineOutlined,
      selectedIcon: AppImages.medicineFilled),
  chat(
      title: "Chat",
      icon: AppImages.chatOutlined,
      selectedIcon: AppImages.chatFilled),
  philhealth(
      title: "PhilHealth",
      icon: AppImages.philhealthOutlined,
      selectedIcon: AppImages.philhealthFilled),
  settings(
    title: "Settings",
    icon: AppImages.settingsOutlined,
    selectedIcon: AppImages.settingsFilled,
  );

  const LayoutPageTab({
    required this.title,
    required this.icon,
    required this.selectedIcon,
  });

  final String title;
  final String icon;
  final String selectedIcon;
}

class LayoutPage extends StatelessWidget {
  static String route = "/layout_route";
  const LayoutPage({
    super.key,
    required this.shell,
  });

  final StatefulNavigationShell shell;

  @override
  Widget build(BuildContext context) {
    return LayoutView(shell: shell);
  }
}
