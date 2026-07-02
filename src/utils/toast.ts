import Toast from 'react-native-toast-message';
import * as Haptics from 'expo-haptics';

export const showToast = (
  type: 'success' | 'error' | 'info',
  text1: string,
  text2?: string
) => {
  if (type === 'success') {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } else if (type === 'error') {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } else {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  Toast.show({
    type,
    text1,
    text2,
    visibilityTime: 3000,
    autoHide: true,
    topOffset: 60,
  });
};

export const toast = {
  success: (title: string, message?: string) => showToast('success', title, message),
  error: (title: string, message?: string) => showToast('error', title, message),
  info: (title: string, message?: string) => showToast('info', title, message),
};
