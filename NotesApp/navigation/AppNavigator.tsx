import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { LoginScreen } from '../screens/LoginScreen';
import { SignUpScreen } from '../screens/SignUpScreen';
import { NotesListScreen } from '../screens/NotesListScreen';
import { NoteEditorScreen } from '../screens/NoteEditorScreen';

const Stack = createStackNavigator();

export const AppNavigator: React.FC = () => {
  const { user } = useAuth();

  return (
    <NavigationContainer>
      {user ? (
        <Stack.Navigator>
          <Stack.Screen
            name="NotesList"
            component={NotesListScreen}
            options={{ title: 'My Notes' }}
          />
          <Stack.Screen
            name="NoteEditor"
            component={NoteEditorScreen}
            options={{ title: 'Note' }}
          />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
};
