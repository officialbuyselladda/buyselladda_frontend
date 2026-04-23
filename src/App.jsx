import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import AdminLayout from './components/AdminLayout';
import Home from './pages/Home';
import Login from './pages/Login';
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
import Footer from './components/Footer';
import Categories from './pages/Categories';
import Favorites from './pages/Favorites';
import Notifications from './pages/Notifications';
import SearchResults from './pages/SearchResults';


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
            <div className="min-h-screen bg-gray-50">
              <Header />
              <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
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
                path="/products/:id" 
                element={<ProductDetail />} 
              />
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
              <Route path="/admin" element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="users" element={<AdminUsers />} />
              </Route>
              <Route path="/admin/login" element={<AdminLogin />} />
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
              <Route path="/search" element={<SearchResults />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Footer />
            <Toaster position="top-right" />
          </div>
        </Router>
      </AuthProvider>
    </LocationProvider>
    </QueryClientProvider>
  );
}


export default App;
