import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import React, { useState } from "react";
import "../../styles/Calendar.css";

const toDateKey = (date) => { // 자바 스크립트의 Date 객체를 받아 "2026-04-01" 같은 문자열 형태로 바꿔주는 함수
  const y = date.getFullYear(); // 년도를 y에
  const m = String(date.getMonth() + 1).padStart(2, "0"); // 월을 m에, 월은 0부터 시작하므로 1을 더해주고 한자리수면 옆에 0을 붙여줌
  const d = String(date.getDate()).padStart(2, "0"); // 일을 d에
  return `${y}-${m}-${d}`;
};

export default function FriendCalendar({
  initialDate,
  onDateChange,
  onMonthChange,
  remainingByDate = {},
}) {
  const getDayMeta = (date) => {
    const day = remainingByDate[toDateKey(date)];

    return {
      hasTodos : day?.hasTodo === true,
      remaining: day?.remaining ?? 0,
      allDone: day?.hasTodo === true && day.remaining === 0
    };
  };


  return (
    <div className="calendar-container">
      <Calendar // 외부 라이브러리를 가져와 화면을 렌더링
        onChange={(value) => onDateChange?.(value instanceof Date ? value : value?.[0])} // 사용자가 클릭할때마다 handledatechange 함수가 실행됨
        onActiveStartDateChange={({activeStartDate}) => onMonthChange?.(activeStartDate)}
        value={initialDate} // 현재 state인 selecteddate를 넘겨주어 달력에 해당 날짜가 포커스되게 함
        calendarType="gregory"
        view="month"
        prev2Label={null}
        next2Label={null}
        showNeighboringMonth={true}
        formatDay={(locale, date) => String(date.getDate())} // 날짜에 '일' 글자를 빼고 숫자만 깔끔하게 보이게 함
        tileContent={({ date, view }) => { // 달력 칸 내부에 ui 추가, 달력의 각 날짜 칸 내부에 html 요소를 추가로 그리는 속성
          if (view !== "month") return null;

          const { hasTodos, remaining, allDone } = getDayMeta(date); // 현재 그리고 있는 타일의 날짜 데이터를 분석 함수에 넣고 결과를 받음
          if (!hasTodos) return null; // 할 일이 없는 날짜 칸이면 아무것도 안 그림

          return <div className="tile-meta">{allDone ? "★" : remaining}</div>; // allDone이 True면 화면에 별을 렌더링하고 False면 화면에 남은 개수를 렌더링
        }}
        tileClassName={({ date, view }) => { // 데이터 상태에 따라 각 날짜 칸에 서로 다른 문자열을 달아줘 화면 생상을 바꿉니다.
          if (view !== "month") return "";

          const { hasTodos, allDone } = getDayMeta(date);
          if (!hasTodos) return "";

          return allDone ? "tile-done" : "tile-has"; // 전부 완료했으면 타일에 tile-done 클래스를 달아주고 남은 일이 있으면 tile-has 클래스를 달아줘서 화면 디자인을 자동으로 바꿈
        }}
      />
    </div>
  );
}