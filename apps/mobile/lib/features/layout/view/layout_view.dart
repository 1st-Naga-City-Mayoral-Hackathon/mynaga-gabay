import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:mynaga_gabay/features/layout/view/layout_page.dart';
import 'package:mynaga_gabay/shared/color.dart';

class LayoutView extends StatelessWidget {
  const LayoutView({
    super.key,
    required this.shell,
  });

  final StatefulNavigationShell shell;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: shell,
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: shell.currentIndex,
        onTap: (index) {
          shell.goBranch(index);
        },
        showSelectedLabels: false,
        showUnselectedLabels: false,
        elevation: 0,
        backgroundColor: AppColor.primary,
        items: LayoutPageTab.values
            .map((tab) => BottomNavigationBarItem(
                  icon: Image.asset(
                    tab.icon,
                    width: 24,
                    height: 24,
                  ),
                  activeIcon: Image.asset(
                    tab.selectedIcon,
                    width: 24,
                    height: 24,
                  ),
                  label: tab.title,
                ))
            .toList(),
      ),
    );
  }
}
