import React, { useMemo } from "react";

import "../../styles/Todo.css";
import "../../styles/FriendTodo.css";

const FriendTodo = ({title = "To do List", todos = [], categories = {} }) => {
  

  return (
    <div className="friend-todo">
      <div className="todo-container">
        <div className="todo-header">
          <div className="todo-title">{title}</div> {/* 부모에게서 받은 title을 화면에 출력 */}
        </div>

        <div className="todo-list">
          {todos.length === 0 ? ( // todos 배열의 데이터 개수가 0개면 등록된 투두가 없습니다 문구를 렌더링하고 1개라도 있으면 아래의 map 함수를 통해 실제 투두 리스트 ui를 렌더링함
            <div className="friend-todo__empty">등록된 투두가 없습니다.</div>
          ) : ( // 배열을 통한 ui 렌더링
            todos.map((t) => ( // 템플리 리터럴과 삼항 연산자를 사용해 데이터가 True면 클래스명에 done을 추가
              <div key={t.id} className={`todo-item ${t.completed ? "done" : ""}`}>
                <div className={`checkbox ${t.completed ? "checked" : ""}`} /> { /* 데이터가 True면 checked 클래스를 추가해 체크박스 ui에 체크 표시 색사응ㄹ 입힙니다. */}
                <div className="todo-text">{t.text}</div> {/* 투두 내용 데이터 출력 */}
                <div
                  className="todo-category" 
                  style={categories[t.category] ?? undefined} // 현재 투두 데이터의 카테고리이름을 key 삼아 위에서 만든 categories 객체에서 해당하는 색상 정보를 꺼내서 html에 직접 적용, 만약 객체에 없는 이상한 카테고리가 들어오면 스타일을 적용하지 않고 넘기라는 장치
                >
                  {t.category} {/* 카테고리 텍스트 화면에 출력 */}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FriendTodo;