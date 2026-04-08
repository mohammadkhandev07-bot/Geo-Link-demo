import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import Channel from './pages/Channel';
import Upload from './pages/Upload';
import Library from './pages/Library';
import Earnings from './pages/Earnings';
import Search from './pages/Search';
import Map from './pages/Map';
import About from './pages/About';
import Legal from './pages/Legal';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/about" element={<About />} />
              <Route path="/legal/:page" element={<Legal />} />
              
              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/home" element={<Home />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/chat/:userId" element={<Chat />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/channel/:handle" element={<Channel />} />
                <Route path="/upload" element={<Upload />} />
                <Route path="/library" element={<Library />} />
                <Route path="/earnings" element={<Earnings />} />
                <Route path="/search" element={<Search />} />
                <Route path="/map" element={<Map />} />
              </Route>
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
