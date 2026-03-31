import { Routes, Route } from 'react-router-dom';
import React from 'react';
import './App.css';
import Header from "./components/Header";
import MainPage from './pages/MainPages/MainPage';
import Footer from "./components/Footer";
//import MainPage from "/MainPage";
//import LoginPage from "pages/LoginPage.LoginPage"


function App() {
  return (
    <div>
      <Header/>

      <Routes>
        <Route path='/' element={<MainPage />} />
      </Routes>
      <h1>test</h1>
      <h1>test</h1>
      <h1>test</h1>
      <h1>test</h1>
      <h1>test</h1>
      <h1>test</h1>
      <h1>test</h1>
      <h1>test</h1>
      
      <Footer/>

    </div>
  );
}

export default App;