import { useEffect, useRef, useState } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";

import {
  CAPTCHA_BASE_URL,
  CaptchaError,
  TURNSTILE_SITE_KEY,
  captchaPage,
  parseCaptchaMessage,
  registerCaptchaHost,
  type CaptchaRequest,
} from "@/services/captcha";
import { colors, fonts } from "@/theme";

/**
 * Runs Cloudflare Turnstile in a hidden web view whenever the app asks for a CAPTCHA token. Usually nobody sees it.
 * When Cloudflare wants a person to tick a box, it appears in a small card over the screen. Mounted once, at the root.
 */
export default function CaptchaHost() {
  const [request, setRequest] = useState<CaptchaRequest | null>(null);
  const [visible, setVisible] = useState(false);
  const current = useRef<CaptchaRequest | null>(null);

  useEffect(
    () =>
      registerCaptchaHost((next) => {
        current.current = next;
        setRequest(next);
        setVisible(false);
      }),
    [],
  );

  if (Platform.OS === "web" || !TURNSTILE_SITE_KEY || !request) return null;

  const onMessage = (event: WebViewMessageEvent) => {
    const pending = current.current;
    if (pending?.id !== request.id) return;
    const message = parseCaptchaMessage(event.nativeEvent.data);
    if (message.type === "show") setVisible(true);
    else if (message.type === "hide") setVisible(false);
    else if (message.type === "token") pending.resolve(message.token);
    else pending.reject(new CaptchaError(message.code));
  };

  return (
    <View style={visible ? styles.scrim : styles.hidden} pointerEvents={visible ? "auto" : "none"}>
      <View style={visible ? styles.card : null} accessibilityViewIsModal={visible}>
        {visible ? <Text style={styles.title}>Quick check that you’re a person</Text> : null}
        <WebView
          key={request.id}
          source={{ html: captchaPage(TURNSTILE_SITE_KEY), baseUrl: CAPTCHA_BASE_URL }}
          originWhitelist={["https://*"]}
          onMessage={onMessage}
          onError={() => current.current?.reject(new CaptchaError("webview_error"))}
          javaScriptEnabled
          style={styles.web}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hidden: { position: "absolute", left: -1000, top: 0, width: 320, height: 80, opacity: 0 },
  scrim: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(0,30,28,0.55)", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 1000 },
  card: { width: "100%", maxWidth: 360, borderRadius: 24, backgroundColor: colors.white, padding: 16, gap: 10 },
  title: { fontFamily: fonts.textBold, fontSize: 17, color: colors.atInk, textAlign: "center" },
  web: { width: "100%", height: 80, backgroundColor: "transparent" },
});
