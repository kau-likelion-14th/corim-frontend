import "../styles/Footer.css";
import logo from"../assets/img/logo.png";

function Footer(){
    return (
        <footer className="footer">
            <div className="footer-top">
                <div className="footer-brand">
                    <img src={logo} alt="LTE 로고" className="footer-logo"/>
                    <span className="footer-title">Lion To-do Everyday</span>
                </div>
                <p className="footer-description">
                    LTE는 멋쟁이 사자처럼에서 개발한 투두 관리 기반의 웹 서비스입니다.
                </p> 
            </div>

            <div className="footer-info"> 
                    <div className="info-row">
                        <div className="info-item">
                            <span className="label">상호명</span>
                            <span className="value">멋쟁이사자처럼</span>
                        </div>
                        <div className="info-item">
                            <span className="label">대표자</span>
                            <span className="value">백다혜</span>
                        </div>
                        <div className="info-item">
                            <span className="label">주소</span>
                            <span className="value">경기로 고양시 항공대학로 76 항공우주센터 3층 창업카페</span>
                        </div>
                    </div>
                    <div className="info-row">
                        <div className="info-item">
                            <span className="label">사업자등록번호</span>
                            <span className="value">333-22-5555</span>
                        </div>
                        <div className="info-item">
                            <span className="label">개인정보보호책임자</span>
                            <span className="value">백다혜</span>
                        </div>
                        <div className="info-item">
                            <span className="label">이메일</span>
                            <span className="value">dada112806@gmail.com</span>
                        </div>
                        <div className="info-item">
                            <span className="label">전화번호</span>
                            <span className="value">010-8348-7196</span>
                        </div>
                 </div>
            </div>
        </footer>
    );
}

export default Footer;