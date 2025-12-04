// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getDatabase, ref, push, set, onValue, remove, update } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDDRO38dv_lcTJAbEhXU7M3nXqVLQYaCIw",
    authDomain: "ygb-todo.firebaseapp.com",
    databaseURL: "https://ygb-todo-default-rtdb.firebaseio.com",
    projectId: "ygb-todo",
    storageBucket: "ygb-todo.firebasestorage.app",
    messagingSenderId: "876783599320",
    appId: "1:876783599320:web:36ac00b516db2c94a221ad"
};

// Initialize Firebase
let app, db;

try {
    app = initializeApp(firebaseConfig);
    db = getDatabase(app);
    console.log("✅ Firebase Realtime Database 초기화 성공");
} catch (error) {
    console.error("❌ Firebase 초기화 실패:", error);
    alert("Firebase 초기화에 실패했습니다. 콘솔을 확인해주세요.");
}

// 할일 데이터 저장
let todos = [];
let editingId = null;
let eventListenersSetup = false; // 이벤트 리스너 설정 여부

// DOM 요소
let todoInput, addBtn, todoList, todoCount;

// Realtime Database에서 할일 불러오기 (실시간 리스너)
function loadTodos() {
    if (!db) {
        console.error("❌ Realtime Database가 초기화되지 않았습니다.");
        return;
    }
    
    console.log("📥 할일 목록 불러오기 시작...");
    
    const todosRef = ref(db, 'todos');
    
    // 실시간 리스너 설정
    onValue(todosRef, (snapshot) => {
        const data = snapshot.val();
        todos = [];
        
        if (data) {
            Object.keys(data).forEach(key => {
                todos.push({
                    id: key,
                    ...data[key]
                });
            });
            
            // 생성 시간으로 정렬 (최신순)
            todos.sort((a, b) => {
                const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return timeB - timeA;
            });
        }
        
        console.log("📋 할일 목록 업데이트:", todos.length, "개");
        renderTodos();
        updateStats();
    }, (error) => {
        console.error("❌ 할일 불러오기 실패:", error);
        console.error("에러 코드:", error.code);
        console.error("에러 메시지:", error.message);
        alert("할일을 불러오는데 실패했습니다.\n\n에러: " + error.message + "\n\nFirebase 콘솔에서 Realtime Database가 활성화되어 있는지 확인해주세요.");
    });
}

// 할일 추가
async function addTodo() {
    if (!db) {
        alert("Firebase가 초기화되지 않았습니다.");
        return;
    }
    
    const text = todoInput.value.trim();
    if (text === '') {
        alert('할일을 입력해주세요!');
        return;
    }
    
    // 입력값 저장 (에러 시 복원용)
    const originalText = text;
    
    try {
        console.log("📤 할일 추가 시도:", text);
        
        const newTodo = {
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        const todosRef = ref(db, 'todos');
        const newTodoRef = push(todosRef);
        await set(newTodoRef, newTodo);
        
        console.log("✅ 할일 추가 성공! ID:", newTodoRef.key);
        
        // 성공 시 입력 필드 즉시 리셋
        todoInput.value = '';
        todoInput.focus();
        
        // loadTodos의 실시간 리스너가 자동으로 업데이트함
    } catch (error) {
        console.error("❌ 할일 추가 실패:", error);
        console.error("에러 코드:", error.code);
        console.error("에러 메시지:", error.message);
        alert("할일 추가에 실패했습니다.\n\n에러: " + error.message + "\n\nFirebase 콘솔에서 Realtime Database 보안 규칙을 확인해주세요.");
        
        // 에러 시 입력값 복원
        todoInput.value = originalText;
        todoInput.focus();
    }
}

// 할일 삭제
async function deleteTodo(id) {
    if (confirm('정말 삭제하시겠습니까?')) {
        try {
            const todoRef = ref(db, `todos/${id}`);
            await remove(todoRef);
            console.log("✅ 할일 삭제 성공!");
            // loadTodos의 실시간 리스너가 자동으로 업데이트함
        } catch (error) {
            console.error("❌ 할일 삭제 실패:", error);
            alert("할일 삭제에 실패했습니다.");
        }
    }
}

// 할일 완료 상태 토글
async function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        try {
            const todoRef = ref(db, `todos/${id}`);
            await update(todoRef, {
                completed: !todo.completed
            });
            console.log("✅ 할일 상태 변경 성공!");
            // loadTodos의 실시간 리스너가 자동으로 업데이트함
        } catch (error) {
            console.error("❌ 할일 상태 변경 실패:", error);
            alert("할일 상태 변경에 실패했습니다.");
        }
    }
}

// 할일 수정 시작
function startEdit(id) {
    editingId = id;
    renderTodos();
}

// 할일 수정 저장
async function saveEdit(id, newText) {
    if (newText.trim() === '') {
        alert('할일 내용을 입력해주세요!');
        return;
    }
    
    try {
        const todoRef = ref(db, `todos/${id}`);
        await update(todoRef, {
            text: newText.trim()
        });
        console.log("✅ 할일 수정 성공!");
        editingId = null;
        // loadTodos의 실시간 리스너가 자동으로 업데이트함
    } catch (error) {
        console.error("❌ 할일 수정 실패:", error);
        alert("할일 수정에 실패했습니다.");
    }
}

// 할일 수정 취소
function cancelEdit() {
    editingId = null;
    renderTodos();
}

// 할일 목록 렌더링
function renderTodos() {
    if (todos.length === 0) {
        todoList.innerHTML = `
            <div class="empty-state">
                <p>📭 할일이 없습니다</p>
            </div>
        `;
    } else {
        todoList.innerHTML = todos.map(todo => {
            const isEditing = editingId === todo.id;
            
            if (isEditing) {
                return `
                    <li class="todo-item">
                        <input 
                            type="text" 
                            class="todo-text editing" 
                            value="${escapeHtml(todo.text)}"
                            id="edit-input-${todo.id}"
                            data-todo-id="${escapeHtml(todo.id)}"
                            autocomplete="off"
                        >
                        <div class="todo-actions">
                            <button class="btn-save" data-todo-id="${escapeHtml(todo.id)}">저장</button>
                            <button class="btn-cancel">취소</button>
                        </div>
                    </li>
                `;
            }
            
            return `
                <li class="todo-item ${todo.completed ? 'completed' : ''}">
                    <input 
                        type="checkbox" 
                        class="todo-checkbox" 
                        ${todo.completed ? 'checked' : ''}
                        data-todo-id="${escapeHtml(todo.id)}"
                    >
                    <span class="todo-text">${escapeHtml(todo.text)}</span>
                    <div class="todo-actions">
                        <button class="btn-edit" data-todo-id="${escapeHtml(todo.id)}">수정</button>
                        <button class="btn-delete" data-todo-id="${escapeHtml(todo.id)}">삭제</button>
                    </div>
                </li>
            `;
        }).join('');
    }
    
    // 수정 모드일 때 입력 필드에 포커스
    if (editingId) {
        const editInput = document.getElementById(`edit-input-${editingId}`);
        if (editInput) {
            editInput.focus();
            editInput.select();
            
            // Enter 키로 저장, Escape 키로 취소
            editInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    saveEdit(editingId, editInput.value);
                } else if (e.key === 'Escape') {
                    cancelEdit();
                }
            });
        }
    }
    
    // 이벤트 위임으로 버튼 클릭 처리 (한 번만 설정)
    if (!eventListenersSetup) {
        setupEventListeners();
        eventListenersSetup = true;
    }
}

// 이벤트 리스너 설정 (이벤트 위임 사용)
function setupEventListeners() {
    console.log("🔧 이벤트 리스너 설정 중...");
    // 체크박스 변경 이벤트
    todoList.addEventListener('change', function(e) {
        if (e.target.classList.contains('todo-checkbox')) {
            const todoId = e.target.getAttribute('data-todo-id');
            if (todoId) {
                toggleTodo(todoId);
            }
        }
    });
    
    // 수정 버튼 클릭
    todoList.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-edit')) {
            const todoId = e.target.getAttribute('data-todo-id');
            if (todoId) {
                startEdit(todoId);
            }
        }
    });
    
    // 삭제 버튼 클릭
    todoList.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-delete')) {
            const todoId = e.target.getAttribute('data-todo-id');
            if (todoId) {
                deleteTodo(todoId);
            }
        }
    });
    
    // 저장 버튼 클릭
    todoList.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-save')) {
            const todoId = e.target.getAttribute('data-todo-id');
            if (todoId) {
                const editInput = document.getElementById(`edit-input-${todoId}`);
                if (editInput) {
                    saveEdit(todoId, editInput.value);
                }
            }
        }
    });
    
    // 취소 버튼 클릭
    todoList.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-cancel')) {
            cancelEdit();
        }
    });
}

// HTML 이스케이프 (XSS 방지)
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 통계 업데이트
function updateStats() {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    const active = total - completed;
    
    todoCount.textContent = `총 ${total}개 (진행중: ${active}개, 완료: ${completed}개)`;
}

// 앱 초기화 함수
function initApp() {
    console.log("🚀 앱 초기화 시작...");
    
    // DOM 요소 가져오기
    todoInput = document.getElementById('todoInput');
    addBtn = document.getElementById('addBtn');
    todoList = document.getElementById('todoList');
    todoCount = document.getElementById('todoCount');
    
    // DOM 요소 확인
    if (!todoInput || !addBtn || !todoList || !todoCount) {
        console.error("❌ 필수 DOM 요소를 찾을 수 없습니다.");
        alert("페이지 로딩에 문제가 있습니다. 새로고침해주세요.");
        return;
    }
    
    console.log("✅ DOM 요소 로드 완료");
    
    // 이벤트 리스너 설정
    addBtn.addEventListener('click', addTodo);
    
    todoInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTodo();
        }
    });
    
    // 할일 목록 불러오기
    loadTodos();
    
    console.log("✅ 앱 초기화 완료");
}

// DOM이 완전히 로드된 후 초기화
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    // DOM이 이미 로드된 경우
    initApp();
}

