import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import DashboardLayout from '../components/DashboardLayout';

// Role dashboards
import StudentDashboard from './dashboards/StudentDashboard';
import TeacherDashboard from './dashboards/TeacherDashboard';
import AdminDashboard from './dashboards/AdminDashboard';
import ParentDashboard from './dashboards/ParentDashboard';
import TechnicalDashboard from './dashboards/TechnicalDashboard';

// Feature pages (data management only — no exam taking)
import CourseManagement from './CourseManagement';
import UserManagement from './UserManagement';
import TestCreation from './TestCreation';
import TestList from './TestList';
import FlagReview from './FlagReview';
import ProfileSettings from './ProfileSettings';
import StudentPerformance from './StudentPerformance';
import StudentCalendar from './StudentCalendar';
import TestResults from './TestResults';
import StudentTestResult from './StudentTestResult';
import AdminBlacklistManager from '../components/AdminBlacklistManager';
import Reports from './Reports';

const roleDashboardMap = {
    admin: '/dashboard/admin',
    teacher: '/dashboard/teacher',
    student: '/dashboard/student',
    parent: '/dashboard/parent',
    technical: '/dashboard/technical',
};

export default function DashboardRouter() {
    const { user } = useAuthStore();
    if (!user) return <Navigate to="/login" replace />;
    const defaultPath = roleDashboardMap[user.role] || '/dashboard/student';

    return (
        <DashboardLayout>
            <Routes>
                {/* Role dashboards */}
                <Route path="admin" element={<AdminDashboard />} />
                <Route path="teacher" element={<TeacherDashboard />} />
                <Route path="student" element={<StudentDashboard />} />
                <Route path="parent" element={<ParentDashboard />} />
                <Route path="technical" element={<TechnicalDashboard />} />

                {/* Feature pages */}
                <Route path="courses" element={<CourseManagement />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="tests/create" element={<TestCreation />} />
                <Route path="tests" element={<TestList />} />
                <Route path="flags" element={<FlagReview />} />
                <Route path="profile" element={<ProfileSettings />} />
                <Route path="performance" element={<StudentPerformance />} />
                <Route path="calendar" element={<StudentCalendar />} />
                <Route path="test-results/:testId" element={<TestResults />} />
                <Route path="results/:sessionId" element={<StudentTestResult />} />
                <Route path="blacklist" element={<AdminBlacklistManager />} />
                <Route path="reports" element={<Reports />} />

                {/* Default redirect */}
                <Route path="" element={<Navigate to={defaultPath} replace />} />
                <Route path="*" element={<Navigate to={defaultPath} replace />} />
            </Routes>
        </DashboardLayout>
    );
}
