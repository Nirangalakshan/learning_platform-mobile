# Poppins Font Setup Guide

## ✅ Installation Complete!

The Poppins font family has been successfully installed and configured in your React Native app.

## 📝 How to Use Poppins

### Default Font (Poppins Regular)

All text will now use Poppins Regular by default. No changes needed!

### Using Different Font Weights

You can use different Poppins weights with Tailwind classes:

```tsx
// Light (300)
<Text className="font-light">Light text</Text>

// Regular (400) - Default
<Text>Regular text</Text>
<Text className="font-sans">Regular text</Text>

// Medium (500)
<Text className="font-medium">Medium text</Text>

// SemiBold (600)
<Text className="font-semibold">SemiBold text</Text>

// Bold (700)
<Text className="font-bold">Bold text</Text>

// ExtraBold (800)
<Text className="font-extrabold">ExtraBold text</Text>

// Black (900)
<Text className="font-black">Black text</Text>
```

### Using with StyleSheet (Non-Tailwind)

If you need to use Poppins in a StyleSheet:

```tsx
import { StyleSheet, Text } from "react-native";

const styles = StyleSheet.create({
  text: {
    fontFamily: "Poppins_400Regular",
  },
  boldText: {
    fontFamily: "Poppins_700Bold",
  },
});

<Text style={styles.text}>Hello</Text>;
```

## 🎨 Available Font Families

- `Poppins_300Light`
- `Poppins_400Regular`
- `Poppins_500Medium`
- `Poppins_600SemiBold`
- `Poppins_700Bold`
- `Poppins_800ExtraBold`
- `Poppins_900Black`

## 🔧 What Was Changed

1. ✅ Installed `@expo-google-fonts/poppins` package
2. ✅ Added font loading in `app/_layout.tsx`
3. ✅ Configured Tailwind to use Poppins in `tailwind.config.js`
4. ✅ App waits for fonts to load before showing content

## 💡 Tips

- The app will show the splash screen until fonts are loaded
- All existing text will automatically use Poppins Regular
- You can mix and match font weights using the classes above
- For tab bar labels, you can add `fontFamily` to the `tabBarLabelStyle` in your tab layout

## 🎯 Next Steps

To apply Poppins to your tab bar labels, update `app/(tabs)/_layout.tsx`:

```tsx
tabBarLabelStyle: {
  fontSize: 10,
  fontWeight: "600",
  marginBottom: 5,
  fontFamily: "Poppins_600SemiBold", // Add this line
},
```
