import "../styles/Header.css";
import logo from"../assets/img/logo.png";
import { NavLink } from "react-router-dom";
import LogOutIcon from"../assets/icon/logout.png";

function Header(){
    return (
        <header className="header">
            {/*로고*/}
            <div className="header-left">
                <img src={logo} alt="LTE 로고" className="header-logo"/>
                <span className="header-title">Lion To-do Evryday</span>
            </div>

            {/*메뉴*/}
            <nav className="header-nav">
                <NavLink to="/home" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
                    홈
                </NavLink>

                <NavLink to="/friends" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}> 
                    친구
                </NavLink>

                <NavLink to="/mypage" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
                    마이페이지
                </NavLink>
            </nav>

            {/*사용자 정보*/}
            <div className="header-right">
                <span className="user-name">백다혜님</span>
                <img src={LogOutIcon} alt="로그아웃" className="header-icon"/>
            </div>
        </header>
    );
}

export default Header;