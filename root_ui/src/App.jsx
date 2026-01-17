import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import Login from './components/Login';
import Signup from './components/Signup';
import Home from './pages/Home';
import Toolkit from './pages/Toolkit';
import NotFound from './components/NotFound';

function App() {
  return (
    <Box minH="100vh" bg="gray.50">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/toolkit" element={<Toolkit />} />
        <Route path="/toolkit/:slug/:coachId" element={<Toolkit />} />

        {/* Catch all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Box>
  );
}

export default App;
