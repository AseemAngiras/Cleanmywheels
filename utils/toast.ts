import Toast from 'react-native-toast-message';

export const showToast = (
  type: 'success' | 'error' | 'info',
  text1: string,
  text2?: string
) => {
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
