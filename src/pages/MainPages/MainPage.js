import React, { useEffect, useState } from "react";
import { get } from "../../Api";
import config from "../../Config";
import CustomCalendar from "./Calendar";
import Todo from "./Todo";
import "../../styles/MainPage.css";

const toDateKey = (date) => { // 날짜 객체를 "YYYY-MM-DD" 문자열로 바꾸는 함수 (달력과 Todo가 같은 키를 쓰기 위함)
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const uid = () => Date.now() + Math.random(); // 고유한 ID를 생성하는 함수 (할 일 항목 각각을 구분하기 위함)


const MainPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date()); // 1. 현재 어떤 날짜가 선택되었는지 관리 (기본값: 오늘)
  const [refreshKey, setRefreshKey] = useState(0);
  
const [viewDate, setViewDate] = useState(selectedDate);
const [remainingByDate, setRemainingByDate] = useState({});

const year = viewDate.getFullYear();
const month = viewDate.getMonth() + 1;

useEffect(() => {
  const controller = new AbortController();
  setRemainingByDate({});

  async function fetchCalendar() {
    try {
      const response = await get(
        config.CALENDAR.GET,
        { year, month },
        { signal: controller.signal }
      );

      if (!Array.isArray(response.result?.days)) {
        throw new Error("캘린더 응답에 days 배열이 없습니다.");
      }

      const daysByDate = Object.fromEntries(
        response.result.days.map((day) => [day.date, day])
      );
      setRemainingByDate(daysByDate);
    } catch (error) {
      if (!controller.signal.aborted) {
        console.error("캘린더 조회 실패", error);
      }
    }
  }

  fetchCalendar();
  return () => controller.abort();
}, [year, month, refreshKey]);

const [todosByDate, setTodosByDate] = useState({});
const dateKey = toDateKey(selectedDate);

useEffect(() => {
  const controller = new AbortController();

  async function fetchTodos() {
    try {
      const response = await get(
        config.TODOS.LIST,
        { date: dateKey },
        { signal: controller.signal }
      );

      if (!Array.isArray(response.result)) {
        throw new Error("Todo 목록 형식을 확인해 주세요.");
      }

      const todos = response.result.map((todo) => ({
        id: todo.todoId,
        text: todo.description,
        category: todo.categoryName,
        completed: todo.completed,
      }));

      setTodosByDate((prev) => ({ ...prev, [dateKey]: todos }));
    } catch (error) {
      if (!controller.signal.aborted) {
        console.error("Todo 목록 조회 실패", error);
      }
    }
  }

  fetchTodos();
  return () => controller.abort();
}, [dateKey, refreshKey]);
  return (
    <div className="mainpage-container">
      <CustomCalendar
        initialDate={selectedDate}
        onDateChange={setSelectedDate}
        onMonthChange={setViewDate}
        remainingByDate={remainingByDate}
      />
      <Todo 
        onCompletionChange={() => setRefreshKey((prev) => prev + 1)}
        selectedDate={selectedDate} // "지금 몇 일을 보고 있는가?" 정보 전달
        todosByDate={todosByDate} // 할 일 목록을 보여주기 위한 데이터 전달
        setTodosByDate={setTodosByDate} // 새로운 할 일을 추가하거나 완료 처리할 때 쓸 변경 함수 전달
      />
    </div>
  );
};

export default MainPage; //MainPage라는 컴포넌트를 다른 파일에서도 가져다 쓸 수 있도록 "밖으로 내보내는" 명령어