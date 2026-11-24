import { Routes, Route, useLocation,Navigate} from 'react-router-dom';
import React from 'react';
import './App.css';
import Header from "./components/Header";
import MainPage from './pages/MainPages/MainPage';
import Footer from "./components/Footer";
import LoginPage from "./pages/LoginPages/Loginpage";
import MyPage from "./pages/MyPages/MyPage";
import ProtectedRoute from './routes/ProtectRoute';
import FriendPage from './pages/FriendPage/FriendPage';
import FriendDetailPage from './pages/FriendPage/FriendDetailPage';



function App() {
  const location = useLocation(); 
  const isLoginPage = 
    location.pathname === '/login'||
    location.pathname === '/login/oauth2/code/kakao'; 

  return ( 
    <div className="app-container"> 
      {!isLoginPage && <Header/>} 

      <main className="main-content">
        <Routes>
          <Route path='/login' element={<LoginPage />}/>
          <Route path='/login/oauth2/code/kakao' element={<LoginPage />}/>
          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<Navigate to="/" replace />} />
            <Route path="/" element={<MainPage/>} /> 
            <Route path='/mypage' element={<MyPage />}/>
            <Route path="/friends" element={<FriendPage />} />
            <Route path="/friends/:id" element={<FriendDetailPage />} /> 
          </Route>
        </Routes>
      </main>

      {!isLoginPage && <Footer/>} 
    </div>
  );
}

export default App;
