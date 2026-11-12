import React, { useEffect, useState } from "react";
import { get, patch } from "../../Api";
import config from "../../Config";
import "../../styles/Todo.css";
import TodoModal from "./TodoModal";

const categoryStyles = {
    공부: { backgroundColor: "#E5F8F1", color: "#333" },
    운동: { backgroundColor: "#FFC8BE", color: "#333" },
    동아리: { backgroundColor: "#B6DAFF", color: "#333" },
};

const defaultCategoryStyle = { backgroundColor: "#eee", color: "#333" };

const toDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const Todo = ({
    selectedDate,
    todosByDate,
    setTodosByDate,
    onCompletionChange,
}) => {
    const dateKey = toDateKey(selectedDate);
    const todos = todosByDate[dateKey] ?? [];

    const [serverCategories, setServerCategories] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTodo, setEditingTodo] = useState(null);
    const [savingId, setSavingId] = useState(null);

    // 카테고리 목록을 조회해서 모달에서 사용하는 { 이름: 스타일 } 형태로 변환
    useEffect(() => {
        const controller = new AbortController();

        async function fetchCategories() {
            try {
                const response = await get(
                    config.CATEGORIES.GET,
                    {},
                    { signal: controller.signal }
                );

                if (!Array.isArray(response.result)) {
                    throw new Error("카테고리 목록 형식을 확인해 주세요.");
                }

                const categories = Object.fromEntries(
                    response.result.map(({ categoryName }) => [
                        categoryName,
                        categoryStyles[categoryName] ?? defaultCategoryStyle,
                    ])
                );

                setServerCategories(categories);
            } catch (error) {
                if (!controller.signal.aborted) {
                    console.error("카테고리 조회 실패", error);
                }
            }
        }

        fetchCategories();
        return () => controller.abort();
    }, []);

    const updateTodos = (updater) => {
        setTodosByDate((prev) => ({
            ...prev,
            [dateKey]: updater(prev[dateKey] ?? []),
        }));
    };

    const openModal = (todo = null) => {
        setEditingTodo(todo);
        setIsModalOpen(true);
    };

    const handleToggleComplete = async (todo) => {
        if (savingId !== null) return;

        // 모달에서 임시로 추가한 항목에는 서버의 todoId가 없음
        if (todo.localOnly) {
            updateTodos((current) =>
                current.map((item) =>
                    item.id === todo.id
                        ? { ...item, completed: !item.completed }
                        : item
                )
            );
            return;
        }

        setSavingId(todo.id);

        try {
            const response = await patch(
                config.TODOS.TOGGLE_COMPLETE(todo.id, dateKey),
                { completed: !todo.completed }
            );

            if (!response.isSuccess) {
                throw new Error(response.message || "완료 상태 변경 실패");
            }
        } catch (error) {
            console.error("Todo 완료 상태 변경 실패", error);
            window.alert("완료 상태를 저장하지 못했어요. 다시 시도해 주세요.");
            return;
        } finally {
            setSavingId(null);
        }

        // MainPage의 refreshKey를 변경해 목록과 달력을 다시 조회
        onCompletionChange();
    };

    const handleSaveTodo = ({ text, category }) => {
        if (editingTodo) {
            updateTodos((current) =>
                current.map((todo) =>
                    todo.id === editingTodo.id
                        ? { ...todo, text, category }
                        : todo
                )
            );
        } else {
            const newTodo = {
                id: `local-${Date.now()}`,
                text,
                category,
                completed: false,
                localOnly: true,
            };
            updateTodos((current) => [...current, newTodo]);
        }

        setIsModalOpen(false);
    };

    const handleDeleteTodo = () => {
        if (!editingTodo) return;

        updateTodos((current) =>
            current.filter((todo) => todo.id !== editingTodo.id)
        );
        setIsModalOpen(false);
    };

    return (
        <div className="todo-container">
            <div className="todo-header">
                <div className="todo-title">To do List</div>
                <button
                    type="button"
                    className="todo-add"
                    aria-label="할 일 추가하기"
                    onClick={() => openModal()}
                >
                    +
                </button>
            </div>

            <div className="todo-list">
                {todos.map((todo) => (
                    <div
                        key={todo.id}
                        className={`todo-item ${todo.completed ? "done" : ""}`}
                        onClick={() => openModal(todo)}
                    >
                        <button
                            type="button"
                            className={`checkbox ${todo.completed ? "checked" : ""}`}
                            aria-label={`${todo.text} 완료`}
                            aria-pressed={todo.completed}
                            disabled={savingId !== null}
                            onClick={(event) => {
                                event.stopPropagation();
                                handleToggleComplete(todo);
                            }}
                        />

                        <div className="todo-text">{todo.text}</div>

                        <div
                            className="todo-category"
                            style={categoryStyles[todo.category] ?? defaultCategoryStyle}
                        >
                            {todo.category}
                        </div>
                    </div>
                ))}
            </div>

            <TodoModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveTodo}
                onDelete={handleDeleteTodo}
                initialTodo={editingTodo}
                categories={serverCategories}
            />
        </div>
    );
};

export default Todo;