import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import UserProjectsPage from "./pages/UserProjectsPage";
import CwlView from "./pages/CWL_view"
import { AuthProvider } from './context/AuthContext'; 
import  ProjectDetails from './pages/ProjecDetailsPage';
import UserRunsPage from "./pages/UserRunsPage";
import RunDetailsPage from "./pages/RunDetailPage";
function PrivateRoute({ children }: { children: JSX.Element }) {
    const token = localStorage.getItem("access_token");
    return token ? children : <Navigate to="/" />;
}

function App() {
    return (
         <AuthProvider>
        <Router>
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
                <Route path="/graph/:idCwl" element={<PrivateRoute><CwlView /></PrivateRoute>} />
                <Route path="/myprojects" element={<PrivateRoute><UserProjectsPage/></PrivateRoute>} />
                <Route path="/myruns" element={<PrivateRoute><UserRunsPage/></PrivateRoute>} />
                <Route path="/myruns/:run_id/files" element={<PrivateRoute><RunDetailsPage /></PrivateRoute>} />


                        
                <Route path="/myproject/:project_id/files" element={<ProjectDetails />} />
            </Routes>
        </Router>
         </AuthProvider>
       
    );
}

export default App;