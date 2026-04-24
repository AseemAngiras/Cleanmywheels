import React from 'react';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

const NotificationManager = () => {
  const { token } = useSelector((state: RootState) => state.auth);
  
  // Only initialize push notifications if the user is logged in
  // because we need to associate the token with the user profile
  if (token) {
    return <NotificationInner />;
  }
  
  return null;
};

const NotificationInner = () => {
  usePushNotifications();
  return null;
};

export default NotificationManager;
