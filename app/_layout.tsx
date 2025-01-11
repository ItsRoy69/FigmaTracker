// _layout.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider } from 'react-native-paper';
import AuthScreen from './screens/AuthScreen';
import DashboardScreen from './screens/DashboardScreen';
import useFigmaAuth from '../hooks/useFigmaAuth';

const Stack = createNativeStackNavigator();

export default function App() {
  const { isAuthenticated, isLoading } = useFigmaAuth();

  if (isLoading) {
    return null;
  }

  return (
    <PaperProvider>
      <Stack.Navigator>
        {!isAuthenticated ? (
          <Stack.Screen 
            name="Auth" 
            component={AuthScreen} 
            options={{ headerShown: false }} 
          />
        ) : (
          <>
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
          </>
        )}
      </Stack.Navigator>
    </PaperProvider>
  );
}