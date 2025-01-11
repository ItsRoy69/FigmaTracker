import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import useFigmaAuth from '../../hooks/useFigmaAuth';

const AuthScreen = () => {
  const { login } = useFigmaAuth();
  const theme = useTheme(); // Access theme for consistent styling

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.colors.primary }]}>
        Welcome to FigmaTracker
      </Text>
      <Button 
        mode="contained" 
        onPress={login} 
        accessibilityLabel="Login with Figma"
      >
        Login with Figma
      </Button>
    </View>
  );
};

export default AuthScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 24,
  },
});
