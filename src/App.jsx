import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';

import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import AdminLayout from './components/AdminLayout';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminLogin from './pages/AdminLogin';
import Register from './pages/Register';
import CreateProduct from './pages/CreateProduct';
import ProductDetail from './pages/ProductDetail';
import Profile from './pages/Profile';
import MyProducts from './pages/MyProducts';
import ChatList from './pages/ChatList';
import ChatRoom from './pages/ChatRoom';

import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import AdminUsers from './pages/AdminUsers';
import AdminChats from './pages/AdminChats';
import AdminReports from './pages/AdminReports';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminSettings from './pages/AdminSettings';
import AdminCategories from './pages/AdminCategories';
import AdminFavorites from './pages/AdminFavorites';
import AdminNotifications from './pages/AdminNotifications';
import AdminModeration from './pages/AdminModeration';
import AdminSystemSettings from './pages/AdminSystemSettings';
import AdminSupportTickets from './pages/AdminSupportTickets';

import Categories from './pages/Categories';
import Favorites from './pages/Favorites';
import Notifications from './pages/Notifications';
import SearchResults from './pages/SearchResults';

import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfUse from './pages/TermsOfUse';
import Help from './pages/Help';
import Contact from './pages/Contact';
import Safety from './pages/Safety';
import ReportProblem from './pages/ReportProblem';
import Support from './pages/Support';


// 🔥 Wrapper (Header/Footer control)
const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isChatRoomRoute = /^\/chats\/[^/]+/.test(location.pathname);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ❗ Admin me header hide */}
      {!isAdminRoute && !isChatRoomRoute && <Header />}

      <Routes>

        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/register" element={<Register />} />

        <Route 
          path="/create-product" 
          element={
            <ProtectedRoute>
              <CreateProduct />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/edit-product/:id" 
          element={
            <ProtectedRoute>
              <CreateProduct />
            </ProtectedRoute>
          } 
        />

        <Route path="/products/:id" element={<ProductDetail />} />

        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/my-products" 
          element={
            <ProtectedRoute>
              <MyProducts />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/chats" 
          element={
            <ProtectedRoute>
              <ChatList />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/chats/:chatId" 
          element={
            <ProtectedRoute>
              <ChatRoom />
            </ProtectedRoute>
          } 
        />

        {/* ADMIN LOGIN */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* ADMIN PANEL */}
        <Route 
          path="/admin" 
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="chats" element={<AdminChats />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="favorites" element={<AdminFavorites />} />
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="support-tickets" element={<AdminSupportTickets />} />
          <Route path="moderation" element={<AdminModeration />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="system-settings" element={<AdminSystemSettings />} />


          {/* ❗ Admin fallback (IMPORTANT) */}
          <Route path="*" element={<div className="p-10 text-xl font-semibold">Admin Page Not Found</div>} />

        </Route>

        {/* OTHER PAGES */}
        <Route path="/categories" element={<Categories />} />

        <Route path="/favorites" element={
          <ProtectedRoute>
            <Favorites />
          </ProtectedRoute>
        } />

        <Route path="/notifications" element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        } />

        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfUse />} />
        <Route path="/help" element={<Help />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/safety" element={<Safety />} />
        <Route path="/report" element={<ReportProblem />} />
        <Route path="/support" element={
          <ProtectedRoute>
            <Support />
          </ProtectedRoute>
        } />
        <Route path="/search" element={<SearchResults />} />

        {/* ❗ PUBLIC fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>

{/* ❗ Admin me footer hide */}
      {!isAdminRoute && !isChatRoomRoute && <Footer />}

      {/* Scroll to top button - visible everywhere */}
      <ScrollToTop />

      <Toaster position="top-right" />
    </div>
  );
};


function App() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <LocationProvider>
        <AuthProvider>
          <Router>
            <AppContent />
          </Router>
        </AuthProvider>
      </LocationProvider>
    </QueryClientProvider>
  );
}

export default App;
