// App.tsx — ponto de entrada do aplicativo
import React from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import HomeScreen from './src/presentation/screens/HomeScreen';

const App: React.FC = () => (
  <SafeAreaProvider>
    <HomeScreen />
  </SafeAreaProvider>
);

export default App;
