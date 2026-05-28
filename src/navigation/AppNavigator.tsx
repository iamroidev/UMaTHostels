import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';

import OnboardingScreen from '../screens/OnboardingScreen';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import ProfileScreen from '../screens/ProfileScreen';
import HostelDetailsScreen from '../screens/HostelDetailsScreen';
import BookingScreen from '../screens/BookingScreen';
import PaymentScreen from '../screens/PaymentScreen';
import PremiumUpgradeScreen from '../screens/PremiumUpgradeScreen';
import MyBookingsScreen from '../screens/MyBookingsScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import MessagesScreen from '../screens/MessagesScreen';
import MessageThreadScreen from '../screens/MessageThreadScreen';
import PaymentHistoryScreen from '../screens/PaymentHistoryScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import HelpSupportScreen from '../screens/HelpSupportScreen';
import AuthLandingScreen from '../screens/auth/AuthLandingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import VerifyEmailScreen from '../screens/auth/VerifyEmailScreen';
import { AuthStackParamList, MainTabParamList, RootStackParamList } from '../types';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../utils/theme';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const EmojiTabIcon: React.FC<{ symbol: string }> = ({ symbol }) => (
  <Text style={{ fontSize: 20 }}>{symbol}</Text>
);

const createEmojiTabIcon = (symbol: string): BottomTabNavigationOptions['tabBarIcon'] => () => (
  <EmojiTabIcon symbol={symbol} />
);

const AuthNavigator: React.FC = () => (
  <AuthStack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: Colors.primary },
      headerTintColor: Colors.white,
      headerTitleStyle: { fontWeight: 'bold' },
    }}
  >
    <AuthStack.Screen
      name="AuthLanding"
      component={AuthLandingScreen}
      options={{ headerShown: false }}
    />
    <AuthStack.Screen name="Login" component={LoginScreen} options={{ title: 'Log In' }} />
    <AuthStack.Screen
      name="Register"
      component={RegisterScreen}
      options={{ title: 'Create Account' }}
    />
    <AuthStack.Screen
      name="VerifyEmail"
      component={VerifyEmailScreen}
      options={{ title: 'Verify Email' }}
    />
  </AuthStack.Navigator>
);

const MainTabs: React.FC = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarStyle: {
        backgroundColor: Colors.primary,
        paddingBottom: 6,
        paddingTop: 6,
        height: 64,
      },
      tabBarActiveTintColor: Colors.secondary,
      tabBarInactiveTintColor: Colors.gray[300],
      headerStyle: { backgroundColor: Colors.primary },
      headerTintColor: Colors.white,
      headerTitleStyle: { fontWeight: 'bold' },
    }}
  >
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{
        title: 'UMAT Hostels',
  tabBarIcon: createEmojiTabIcon('🏠'),
      }}
    />
    <Tab.Screen
      name="Search"
      component={SearchScreen}
      options={{
        title: 'Search',
  tabBarIcon: createEmojiTabIcon('🔍'),
      }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        title: 'Profile',
  tabBarIcon: createEmojiTabIcon('👤'),
      }}
    />
  </Tab.Navigator>
);

const LoadingView: React.FC = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
    <ActivityIndicator size="large" color={Colors.primary} />
  </View>
);

const linking = {
  prefixes: ['umat-hostels://', 'https://umat-hostels.app'],
};

const AppNavigator: React.FC = () => {
  const { initializing, session } = useAuth();
  const navigationRef = useNavigationContainerRef();
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const value = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_SEEN);
        setHasSeenOnboarding(value === 'true');
      } finally {
        setOnboardingChecked(true);
      }
    };

    checkOnboarding();
  }, []);

  const initialRoute = useMemo<keyof RootStackParamList>(() => {
    if (!hasSeenOnboarding) {
      return 'Onboarding';
    }
    if (session) {
      return 'MainTabs';
    }
    return 'Auth';
  }, [hasSeenOnboarding, session]);

  if (initializing || !onboardingChecked) {
    return <LoadingView />;
  }

  return (
    <NavigationContainer ref={navigationRef} linking={linking}>
      <RootStack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: Colors.white,
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <RootStack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
        <RootStack.Screen name="Auth" component={AuthNavigator} options={{ headerShown: false }} />
        <RootStack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
        <RootStack.Screen
          name="HostelDetails"
          component={HostelDetailsScreen}
          options={{ title: 'Hostel Details' }}
        />
        <RootStack.Screen
          name="Booking"
          component={BookingScreen}
          options={{ title: 'Booking Details' }}
        />
        <RootStack.Screen
          name="Payment"
          component={PaymentScreen}
          options={{ title: 'Payment' }}
        />
        <RootStack.Screen
          name="PremiumUpgrade"
          component={PremiumUpgradeScreen}
          options={{ title: 'Premium Upgrade' }}
        />
        <RootStack.Screen
          name="Bookings"
          component={MyBookingsScreen}
          options={{ title: 'My Bookings' }}
        />
        <RootStack.Screen
          name="Favorites"
          component={FavoritesScreen}
          options={{ title: 'Favorites' }}
        />
        <RootStack.Screen
          name="Messages"
          component={MessagesScreen}
          options={{ title: 'Messages' }}
        />
        <RootStack.Screen
          name="MessageThread"
          component={MessageThreadScreen}
          options={{ title: 'Conversation' }}
        />
        <RootStack.Screen
          name="PaymentHistory"
          component={PaymentHistoryScreen}
          options={{ title: 'Payment History' }}
        />
        <RootStack.Screen
          name="EditProfile"
          component={EditProfileScreen}
          options={{ title: 'Edit Profile' }}
        />
        <RootStack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ title: 'Settings' }}
        />
        <RootStack.Screen
          name="HelpSupport"
          component={HelpSupportScreen}
          options={{ title: 'Help & Support' }}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
