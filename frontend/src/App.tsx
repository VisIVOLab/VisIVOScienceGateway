import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import UserDagsPage from "./pages/UserDagsPage";

function PrivateRoute({ children }: { children: JSX.Element }) {
    const token = localStorage.getItem("access_token");
    return token ? children : <Navigate to="/" />;
}

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
                <Route path="/dags" element={<PrivateRoute><UserDagsPage /></PrivateRoute>} />
            </Routes>
        </Router>
    );
}

export default App;