import React, { useLayoutEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation, Outlet, Navigate } from 'react-router-dom';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Public Pages
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import PackagesPage from './pages/PackagesPage';
import PackageDetailPage from './pages/PackageDetailPage';
import AITripPlannerPage from './pages/AITripPlannerPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ProfilePage from './pages/ProfilePage';
import UserBookingsPage from './pages/UserBookingsPage';
import LikedPackagesPage from './pages/LikedPackagesPage';


// Admin Pages
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AddPackagePage from './pages/admin/AddPackagePage';
import ManagePackagesPage from './pages/admin/ManagePackagesPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import ManageBookingsPage from './pages/admin/ManageBookingsPage';

// Admin Utilities
import AdminLayout from './components/AdminLayout';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import UserProtectedRoute from './components/UserProtectedRoute';

const ScrollToTop = () => {
    const { pathname } = useLocation();

    useLayoutEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
};

// Layout for public-facing pages
const PublicLayout: React.FC = () => {
    return (
        <div className="flex flex-col min-h-screen bg-black text-white">
            <Navbar />
            <main className="flex-grow">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};


// Wrapper component that provides Router context
const App: React.FC = () => {
    return (
        <Router>
            <ScrollToTop />
            <Routes>
                {/* Public Routes with Navbar and Footer */}
                <Route element={<PublicLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/packages" element={<PackagesPage />} />
                    <Route path="/packages/:packageId" element={<PackageDetailPage />} />
                    <Route path="/ai-planner" element={<AITripPlannerPage />} />
                    <Route
                        path="/profile"
                        element={
                            <UserProtectedRoute>
                                <ProfilePage />
                            </UserProtectedRoute>
                        }
                    />
                    <Route
                        path="/my-bookings"
                        element={
                            <UserProtectedRoute>
                                <UserBookingsPage />
                            </UserProtectedRoute>
                        }
                    />
                    <Route
                        path="/liked-packages"
                        element={
                            <UserProtectedRoute>
                                <LikedPackagesPage />
                            </UserProtectedRoute>
                        }
                    />
                    <Route path="*" element={
                        <div className="text-center py-40">
                            <h1 className="text-6xl font-bold">404</h1>
                            <p className="mt-4 text-xl text-gray-400">Page Not Found</p>
                        </div>
                    } />
                </Route>

                {/* Standalone authentication pages */}
                <Route path="/signin" element={<SignInPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/admin/login" element={<AdminLoginPage />} />

                {/* Admin Routes with Admin Layout */}
                <Route
                    path="/admin"
                    element={
                        <AdminProtectedRoute>
                            <AdminLayout />
                        </AdminProtectedRoute>
                    }
                >
                    <Route index element={<Navigate to="/admin/dashboard" replace />} />
                    <Route path="dashboard" element={<AdminDashboardPage />} />
                    <Route path="add-package" element={<AddPackagePage />} />
                    <Route path="manage-packages" element={<ManagePackagesPage />} />
                    <Route path="manage-users" element={<UserManagementPage />} />
                    <Route path="manage-bookings" element={<ManageBookingsPage />} />
                </Route>
            </Routes>
        </Router>
    );
};

export default App;