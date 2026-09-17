import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

// Unified Multi-Vendor Delivery App for Gulbarga (Food + Grocery)
void main() {
  runApp(const GulbargaDeliveryApp());
}

class GulbargaDeliveryApp extends StatefulWidget {
  const GulbargaDeliveryApp({super.key});

  static void setLocale(BuildContext context, Locale newLocale) {
    _GulbargaDeliveryAppState? state =
        context.findAncestorStateOfType<_GulbargaDeliveryAppState>();
    state?.setLocale(newLocale);
  }

  @override
  State<GulbargaDeliveryApp> createState() => _GulbargaDeliveryAppState();
}

class _GulbargaDeliveryAppState extends State<GulbargaDeliveryApp> {
  Locale _locale = const Locale('en');

  void setLocale(Locale locale) {
    setState(() {
      _locale = locale;
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Gulbarga QuickBite & Kirana',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorSchemeSeed: const Color(0xFFE23744), // Zomato/Zepto vibrant crimson
        scaffoldBackgroundColor: const Color(0xFF0F172A),
      ),
      locale: _locale,
      supportedLocales: const [
        Locale('en', 'US'),
        Locale('hi', 'IN'),
      ],
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      home: const CustomerHomeScreen(),
    );
  }
}

class CustomerHomeScreen extends StatefulWidget {
  const CustomerHomeScreen({super.key});

  @override
  State<CustomerHomeScreen> createState() => _CustomerHomeScreenState();
}

class _CustomerHomeScreenState extends State<CustomerHomeScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  int _selectedVerticalIndex = 0; // 0: Food, 1: Grocery

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  Widget build(BuildContext context) {
    final isHindi = Localizations.localeOf(context).languageCode == 'hi';

    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.location_on, color: Color(0xFFEF4444), size: 18),
                const SizedBox(width: 4),
                Text(
                  isHindi ? 'गुलबर्गा, कर्नाटक' : 'Gulbarga, Karnataka',
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                ),
                const Icon(Icons.keyboard_arrow_down, color: Colors.white70, size: 20),
              ],
            ),
            Text(
              isHindi ? 'सेडम रोड, सेंट्रल बस स्टैंड के पास' : 'Sedam Road, Near Central Bus Stand',
              style: const TextStyle(fontSize: 12, color: Colors.white60),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.language, color: Colors.white),
            tooltip: 'Language / भाषा',
            onPressed: () {
              final newLocale = isHindi ? const Locale('en') : const Locale('hi');
              GulbargaDeliveryApp.setLocale(context, newLocale);
            },
          ),
          IconButton(
            icon: const Icon(Icons.shopping_bag_outlined, color: Colors.white),
            onPressed: () {},
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: const Color(0xFFEF4444),
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white60,
          onTap: (index) {
            setState(() {
              _selectedVerticalIndex = index;
            });
          },
          tabs: [
            Tab(
              icon: const Icon(Icons.restaurant),
              text: isHindi ? 'खाना डिलीवरी' : 'Food Delivery',
            ),
            Tab(
              icon: const Icon(Icons.local_grocery_store),
              text: isHindi ? 'इंस्टा किराना' : 'Insta Grocery',
            ),
          ],
        ),
      ),
      body: Center(
        child: Text(
          _selectedVerticalIndex == 0
              ? (isHindi ? 'गुलबर्गा रेस्टोरेंट कैटलॉग लोड हो रहा है...' : 'Loading Gulbarga Restaurants...')
              : (isHindi ? 'गुलबर्गा किराना कैटलॉग लोड हो रहा है...' : 'Loading Gulbarga Grocery Catalog...'),
          style: const TextStyle(color: Colors.white70, fontSize: 16),
        ),
      ),
    );
  }
}
