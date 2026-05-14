/* Telegram WebApp haptic helpers — no-op outside the Telegram client. */

type ImpactStyle = "light" | "medium" | "heavy" | "rigid" | "soft";
type NotificationType = "error" | "success" | "warning";

interface HapticFeedback {
  impactOccurred: (style: ImpactStyle) => void;
  notificationOccurred: (type: NotificationType) => void;
  selectionChanged: () => void;
}
interface TelegramWebApp {
  HapticFeedback?: HapticFeedback;
}
interface WindowWithTelegram extends Window {
  Telegram?: { WebApp?: TelegramWebApp };
}

function getHaptics(): HapticFeedback | undefined {
  if (typeof window === "undefined") return undefined;
  const w = window as WindowWithTelegram;
  return w.Telegram?.WebApp?.HapticFeedback;
}

export function impact(style: ImpactStyle = "medium") {
  try {
    getHaptics()?.impactOccurred(style);
  } catch {
    /* swallow */
  }
}

export function selection() {
  try {
    getHaptics()?.selectionChanged();
  } catch {
    /* swallow */
  }
}

export function notify(type: NotificationType) {
  try {
    getHaptics()?.notificationOccurred(type);
  } catch {
    /* swallow */
  }
}
