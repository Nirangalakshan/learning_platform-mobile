import { Ionicons } from "@expo/vector-icons";
import { Base64 } from "js-base64";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

interface MermaidRendererProps {
  mermaidCode: string;
}

export default function MermaidRenderer({ mermaidCode }: MermaidRendererProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [useImage, setUseImage] = useState(true);
  const [isZoomed, setIsZoomed] = useState(false);

  // Clean the mermaid code more robustly
  const cleanCode = (raw: string) => {
    const match =
      raw.match(/```mermaid([\s\S]*?)```/) || raw.match(/```([\s\S]*?)```/);
    let code = match ? match[1].trim() : raw.trim();
    return code;
  };

  const code = cleanCode(mermaidCode);

  // Use js-base64 for safer encoding
  const base64Code = Base64.encode(code);
  const imageUrl = `https://mermaid.ink/img/${base64Code}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, user-scalable=yes" />
        <!-- Primary CDN -->
        <script src="https://cdn.jsdelivr.net/npm/mermaid@10.9.1/dist/mermaid.min.js"></script>
        <!-- Fallback if Primary fails -->
        <script>
          if (typeof mermaid === 'undefined') {
            const script = document.createElement('script');
            script.src = "https://unpkg.com/mermaid@10.9.1/dist/mermaid.min.js";
            document.head.appendChild(script);
          }
        </script>
        <style>
          html, body { 
            height: 100%; 
            margin: 0; padding: 0; 
            background-color: ${isDark ? "#1a1a1a" : "#f9fafb"}; 
          }
          body { 
            display: flex; 
            justify-content: center; 
            align-items: flex-start;
            padding: 20px;
          }
          #diagram { 
            width: 100%; 
            display: flex; 
            justify-content: center; 
          }
          svg { 
            width: 100% !important; 
            height: auto !important; 
            max-width: 100%; 
          }
          .error-container {
            color: #ef4444;
            background: rgba(239, 68, 68, 0.1);
            padding: 12px;
            border-radius: 8px;
            font-family: monospace;
            font-size: 11px;
            width: 100%;
          }
        </style>
      </head>
      <body>
        <div id="diagram"></div>
        <script>
          let retryCount = 0;
          const maxRetries = 50; // Increased to 10 seconds (50 * 200ms)

          const renderDiagram = () => {
            const statusElement = document.getElementById('diagram');
            if (typeof mermaid !== 'undefined') {
              try {
                mermaid.initialize({ 
                  startOnLoad: false, 
                  theme: '${isDark ? "dark" : "default"}',
                  securityLevel: 'loose',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  logLevel: 1
                });
                
                const code = ${JSON.stringify(code)};
                
                mermaid.render('graphDiv', code).then(({svg}) => {
                  statusElement.innerHTML = svg;
                }).catch(err => {
                  statusElement.innerHTML = '<div class="error-container"><b>Mermaid Syntax Error:</b><br/>' + err.message + '</div>';
                });
              } catch (e) {
                statusElement.innerHTML = '<div class="error-container"><b>Initialization Error:</b><br/>' + e.message + '</div>';
              }
            } else if (retryCount < maxRetries) {
              retryCount++;
              if (retryCount % 5 === 0) {
                 statusElement.innerHTML = '<div style="color:#64748b;font-size:12px;text-align:center;padding:20px;">' +
                  'Loading Mermaid library... (' + Math.round(retryCount/5) + 's)</div>';
              }
              setTimeout(renderDiagram, 200);
            } else {
              statusElement.innerHTML = '<div class="error-container"><b>Timeout:</b> Failed to load Mermaid library from any CDN. Please check your internet connection.</div>';
            }
          };
          
          window.onload = renderDiagram;
          setTimeout(renderDiagram, 500); // Kickstart if onload already fired
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
          <View style={styles.imageWrapper}>
            <Image
              source={{ uri: imageUrl }}
              style={styles.image}
              resizeMode="contain"
            />
            {/* Overlay Zoom Button for Static Image */}
            <TouchableOpacity
              style={styles.zoomFab}
              onPress={() => setIsZoomed(true)}
            >
              <Ionicons name="expand" size={20} color="white" />
            </TouchableOpacity>
          </View>
        ) : (
          <WebView
            originWhitelist={["*"]}
            source={{ html }}
            style={styles.webview}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            scalesPageToFit={true}
            scrollEnabled={true}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.loading}>
                <ActivityIndicator size="large" color="#9333ea" />
              </View>
            )}
          />
        )}
      </View>

      {/* Full Screen Zoom Modal */}
      <Modal visible={isZoomed} animationType="slide" transparent={false}>
        <SafeAreaView
          style={{ flex: 1, backgroundColor: isDark ? "#0a0a0a" : "#fff" }}
        >
          <View style={styles.modalHeader}>
            <View>
              <Text
                style={[styles.modalTitle, { color: isDark ? "#fff" : "#000" }]}
              >
                Visual Layout
              </Text>
              <Text style={{ color: "#64748b", fontSize: 12 }}>
                Pinch to zoom in/out
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setIsZoomed(false)}
              style={styles.closeBtn}
            >
              <Ionicons
                name="close-circle"
                size={32}
                color={isDark ? "#fff" : "#000"}
              />
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1 }}>
            <WebView
              originWhitelist={["*"]}
              source={{ uri: imageUrl }}
              style={{ flex: 1, backgroundColor: isDark ? "#0a0a0a" : "#fff" }}
              scalesPageToFit={true}
              builtInZoomControls={true}
              displayZoomControls={false}
              startInLoadingState={true}
              renderLoading={() => (
                <View
                  style={[
                    styles.loading,
                    { backgroundColor: isDark ? "#0a0a0a" : "#fff" },
                  ]}
                >
                  <ActivityIndicator size="large" color="#9333ea" />
                  <Text
                    style={{
                      marginTop: 12,
                      color: "#64748b",
                      fontWeight: "500",
                    }}
                  >
                    Preparing Diagram...
                  </Text>
                </View>
              )}
            />
          </View>
        </SafeAreaView>
      </Modal>
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
    position: "relative",
  },
  imageWrapper: {
    flex: 1,
    padding: 10,
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  zoomFab: {
    position: "absolute",
    right: 16,
    bottom: 16,
    backgroundColor: "#9333ea",
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
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
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  closeBtn: {
    padding: 4,
  },
  modalFooter: {
    padding: 16,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  footerText: {
    color: "#64748b",
    fontSize: 14,
  },
});
