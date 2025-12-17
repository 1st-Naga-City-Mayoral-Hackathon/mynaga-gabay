import 'package:curved_navigation_bar/curved_navigation_bar.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:mynaga_gabay/features/layout/view/layout_page.dart';
import 'package:mynaga_gabay/shared/color.dart';

class LayoutView extends StatefulWidget {
  const LayoutView({
    super.key,
    required this.shell,
  });

  final StatefulNavigationShell shell;

  @override
  State<LayoutView> createState() => _LayoutViewState();
}

class _LayoutViewState extends State<LayoutView> {
  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      top: false,
      child: Scaffold(
        extendBody: true,
        body: widget.shell,
        bottomNavigationBar: CurvedNavigationBar(
          index: widget.shell.currentIndex,
          backgroundColor: Colors.transparent,
          color: AppColor.primary.withValues(alpha: 0.2),
          items: LayoutPageTab.values
              .map((tab) => ClipRRect(
                    child: Image.asset(
                      tab.icon,
                      width: 24,
                      height: 24,
                      color: AppColor.grey,
                    ),
                  ))
              .toList(),
          animationDuration: const Duration(milliseconds: 500),
          onTap: (index) => widget.shell.goBranch(
            index,
            initialLocation: true,
          ),
        ),
      ),
    );
  }
}
