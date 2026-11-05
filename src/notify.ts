import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
});

export async function askNotifications() {
  const r = await Notifications.requestPermissionsAsync();
  return r.granted;
}

/** "How was it?" nudge after a pick. */
export async function scheduleRating(historyId: string, itemName: string, restaurant: string) {
  const p = await Notifications.getPermissionsAsync();
  if (!p.granted) return;
  await Notifications.scheduleNotificationAsync({
    content: { title: `How was the ${itemName}?`, body: `Rate your pick at ${restaurant} so Pickybara learns your taste.`, data: { historyId } },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 90 * 60 },
  });
}

export function listenForRatingTaps() {
  const sub = Notifications.addNotificationResponseReceivedListener((r) => {
    const id = r.notification.request.content.data?.historyId;
    if (typeof id === 'string') router.push({ pathname: '/rate/[id]', params: { id } });
  });
  return () => sub.remove();
}

export const cancelAllReminders = () => Notifications.cancelAllScheduledNotificationsAsync();
