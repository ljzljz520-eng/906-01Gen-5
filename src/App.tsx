import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar, Footer } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { DatasetListPage } from './pages/DatasetListPage';
import { DatasetDetailPage } from './pages/DatasetDetailPage';
import { SubmitDatasetPage } from './pages/SubmitDatasetPage';
import { AdminReviewPage } from './pages/AdminReviewPage';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import { UserProfilePage } from './pages/UserProfilePage';
import { UserFavoritesPage } from './pages/UserFavoritesPage';
import { UserSubmissionsPage } from './pages/UserSubmissionsPage';
import { UserNotificationsPage } from './pages/UserNotificationsPage';
import { NotFoundPage } from './pages/NotFoundPage';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-academic-50">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/datasets" element={<DatasetListPage />} />
            <Route path="/datasets/:id" element={<DatasetDetailPage />} />
            <Route path="/submit" element={<SubmitDatasetPage />} />
            <Route path="/admin/review" element={<AdminReviewPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/user/profile" element={<UserProfilePage />} />
            <Route path="/user/favorites" element={<UserFavoritesPage />} />
            <Route path="/user/submissions" element={<UserSubmissionsPage />} />
            <Route path="/user/notifications" element={<UserNotificationsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
