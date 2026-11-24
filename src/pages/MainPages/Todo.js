import React, { useEffect, useState } from "react";
import { get, post, put, patch, del } from "../../Api";
import config from "../../Config";
import "../../styles/Todo.css";
import TodoModal from "./TodoModal";

const categoryStyles = {
    공부: { backgroundColor: "#E5F8F1", color: "#333" },
    운동: { backgroundColor: "#FFC8BE", color: "#333" },
    동아리: { backgroundColor: "#B6DAFF", color: "#333" },
};

const defaultCategoryStyle = { backgroundColor: "#eee", color: "#333" };

const WEEKS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

const toDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const getErrorMessage = (error, fallback) =>
    error.response?.data?.message || fallback;

const toRoutine = (detail) => {
    if (!detail.routineEnabled) return null;

    const repeatDays = WEEKS.indexOf(detail.week);

    return {
        startDate: detail.startDate ?? "",
        endDate: detail.endDate ?? "",
        repeatDays: repeatDays >= 0 ? repeatDays : null,
    };
};

const Todo = ({
    selectedDate,
    todosByDate,
    onCompletionChange,
}) => {
    const dateKey = toDateKey(selectedDate);
    const todos = todosByDate[dateKey] ?? [];

    const [serverCategories, setServerCategories] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTodo, setEditingTodo] = useState(null);
    const [savingId, setSavingId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    const openModal = async (todo = null) => {
        if (!todo) {
            setEditingTodo(null);
            setIsModalOpen(true);
            return;
        }

        try {
            const response = await get(config.TODOS.DETAIL(todo.id));

            if (!response.isSuccess || !response.result) {
                throw new Error(response.message || "할 일 상세 조회 실패");
            }

            const detail = response.result;

            setEditingTodo({
                id: detail.todoId,
                text: detail.description,
                category: detail.categoryName,
                routineEnabled: detail.routineEnabled,
                routine: toRoutine(detail),
            });
            setIsModalOpen(true);
        } catch (error) {
            console.error("Todo 상세 조회 실패", error);
            window.alert(
                getErrorMessage(error, "할 일 정보를 불러오지 못했어요. 다시 시도해 주세요.")
            );
        }
    };

    const handleToggleComplete = async (todo) => {
        if (savingId !== null) return;

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

        onCompletionChange();
    };

    const toRequestBody = ({ text, category, routine }) => {
        const routineEnabled = Boolean(routine);

        return {
            categoryName: category,
            description: text,
            routineEnabled,
            startDate: routineEnabled ? routine.startDate || dateKey : null,
            endDate: routineEnabled ? routine.endDate || null : null,
            week: routineEnabled ? WEEKS[routine.repeatDays] ?? null : null,
        };
    };

    const handleSaveTodo = async (form) => {
        if (isSubmitting) return;

        const body = toRequestBody(form);

        if (editingTodo && editingTodo.routineEnabled !== body.routineEnabled) {
            window.alert("일반 할 일과 루틴은 서로 바꿀 수 없어요.");
            return;
        }

        setIsSubmitting(true);

        try {
            const response = editingTodo
                ? await put(config.TODOS.UPDATE(editingTodo.id), body)
                : await post(config.TODOS.CREATE, body, {
                    params: { date: dateKey },
                });

            if (!response.isSuccess) {
                throw new Error(response.message || "할 일 저장 실패");
            }

            setIsModalOpen(false);
            onCompletionChange();
        } catch (error) {
            console.error("Todo 저장 실패", error);
            window.alert(
                getErrorMessage(error, "할 일을 저장하지 못했어요. 다시 시도해 주세요.")
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteTodo = async () => {
        if (!editingTodo || isSubmitting) return;

        setIsSubmitting(true);

        try {
            const response = await del(
                config.TODOS.DELETE(editingTodo.id, dateKey)
            );

            if (!response.isSuccess) {
                throw new Error(response.message || "할 일 삭제 실패");
            }

            setIsModalOpen(false);
            onCompletionChange();
        } catch (error) {
            console.error("Todo 삭제 실패", error);
            window.alert(
                getErrorMessage(error, "할 일을 삭제하지 못했어요. 다시 시도해 주세요.")
            );
        } finally {
            setIsSubmitting(false);
        }
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
                isSubmitting={isSubmitting}
            />
        </div>
    );
};

export default Todo;