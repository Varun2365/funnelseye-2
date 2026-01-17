import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import Dashboard from './dashboard';

const theme = extendTheme({
  colors: {
    brand: {
      50: '#f0f9f0',
      100: '#c6f6c6',
      200: '#9cf29c',
      300: '#72ee72',
      400: '#48ea48',
      500: '#1ee61e',
      600: '#18b818',
      700: '#128a12',
      800: '#0c5c0c',
      900: '#062e06',
    },
  },
  fonts: {
    heading: 'Inter, sans-serif',
    body: 'Inter, sans-serif',
  },
});

function App() {
  return (
    <ChakraProvider theme={theme}>
      <Dashboard />
    </ChakraProvider>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

