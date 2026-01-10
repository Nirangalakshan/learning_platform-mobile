import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { WebView } from "react-native-webview";

interface MermaidRendererProps {
  mermaidCode: string;
}

export default function MermaidRenderer({ mermaidCode }: MermaidRendererProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [useImage, setUseImage] = useState(true);

  // Clean the mermaid code more robustly
  const cleanCode = (raw: string) => {
    const match =
      raw.match(/```mermaid([\s\S]*?)```/) || raw.match(/```([\s\S]*?)```/);
    let code = match ? match[1].trim() : raw.trim();
    return code;
  };

  const code = cleanCode(mermaidCode);

  // Create a base64 version for mermaid.ink
  // Note: btoa is available in most modern JS environments (like React Native / Expo)
  const base64Code = btoa(unescape(encodeURIComponent(code)));
  const imageUrl = `https://mermaid.ink/img/${base64Code}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
        <style>
          body { 
            margin: 0; 
            padding: 15px; 
            background-color: ${isDark ? "#1a1a1a" : "#f9fafb"};
            display: flex;
            justify-content: center;
          }
          #diagram { width: 100%; }
          svg { width: 100% !important; height: auto !important; }
        </style>
      </head>
      <body>
        <div id="diagram"></div>
        <script>
          const initMermaid = () => {
            if (typeof mermaid !== 'undefined') {
              try {
                mermaid.initialize({ 
                  startOnLoad: false, 
                  theme: '${isDark ? "dark" : "default"}',
                  securityLevel: 'loose'
                });
                const graphDefinition = \`${code.replace(/`/g, "\\`").replace(/\$/g, "\\$")}\`;
                mermaid.render('graphDiv', graphDefinition).then(({svg}) => {
                  document.getElementById('diagram').innerHTML = svg;
                });
              } catch (e) {
                document.body.innerHTML = '<div style="color:red">' + e.message + '</div>';
              }
            } else {
              setTimeout(initMermaid, 100);
            }
          };
          initMermaid();
        </script>
      </body>
    </html>
  `;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? "#1a1a1a" : "#f9fafb" },
      ]}
    >
      {/* Toggle Bar */}
      <View style={styles.toggleBar}>
        <TouchableOpacity
          onPress={() => setUseImage(true)}
          style={[styles.toggleBtn, useImage && styles.activeBtn]}
        >
          <Ionicons
            name="image-outline"
            size={14}
            color={useImage ? "#9333ea" : "#64748b"}
          />
          <Text style={[styles.toggleText, useImage && styles.activeText]}>
            Image
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setUseImage(false)}
          style={[styles.toggleBtn, !useImage && styles.activeBtn]}
        >
          <Ionicons
            name="git-branch-outline"
            size={14}
            color={!useImage ? "#9333ea" : "#64748b"}
          />
          <Text style={[styles.toggleText, !useImage && styles.activeText]}>
            Interactive
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {useImage ? (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: imageUrl }}
              style={styles.image}
              resizeMode="contain"
            />
          </View>
        ) : (
          <WebView
            originWhitelist={["*"]}
            source={{ html }}
            style={styles.webview}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.loading}>
                <ActivityIndicator size="large" color="#9333ea" />
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 500,
    width: "100%",
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  toggleBar: {
    flexDirection: "row",
    padding: 6,
    backgroundColor: "rgba(0,0,0,0.03)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  toggleBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    borderRadius: 10,
  },
  activeBtn: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
    marginLeft: 6,
  },
  activeText: {
    color: "#9333ea",
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    flex: 1,
    padding: 15,
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  webview: {
    flex: 1,
    backgroundColor: "transparent",
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
});
