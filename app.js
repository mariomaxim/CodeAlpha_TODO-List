
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const tasksCounter = document.getElementById('tasks-counter');
const clearCompletedBtn = document.getElementById('clear-completed');
const filterBtns = document.querySelectorAll('.filter-btn');
const editModal = document.getElementById('edit-modal');
const closeModal = document.querySelector('.close-modal');
const editTaskInput = document.getElementById('edit-task-input');
const saveEditBtn = document.getElementById('save-edit-btn');

let tasks = [];
let currentFilter = 'all';
let currentEditTaskId = null;


function initialize() {
    loadTasksFromLocalStorage();
    renderTasks();
    updateTasksCounter();
    

    taskForm.addEventListener('submit', handleAddTask);
    taskList.addEventListener('click', handleTaskActions);
    clearCompletedBtn.addEventListener('click', clearCompletedTasks);
    filterBtns.forEach(btn => btn.addEventListener('click', handleFilterChange));
    closeModal.addEventListener('click', closeEditModal);
    saveEditBtn.addEventListener('click', saveTaskEdit);
    

    window.addEventListener('click', (e) => {
        if (e.target === editModal) {
            closeEditModal();
        }
    });
}


function loadTasksFromLocalStorage() {
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
        tasks = JSON.parse(storedTasks);
    }
}

function saveTasksToLocalStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}


function handleAddTask(e) {
    e.preventDefault();
    
    const taskText = taskInput.value.trim();
    if (!taskText) return;
    
    const newTask = {
        id: Date.now().toString(),
        text: taskText,
        completed: false,
        createdAt: new Date()
    };
    
    tasks.unshift(newTask); 
    saveTasksToLocalStorage();
    renderTasks();
    updateTasksCounter();
    
    taskInput.value = '';
    taskInput.focus();
}


function toggleTaskCompletion(taskId) {
    tasks = tasks.map(task => {
        if (task.id === taskId) {
            return { ...task, completed: !task.completed };
        }
        return task;
    });
    
    saveTasksToLocalStorage();
    renderTasks();
    updateTasksCounter();
}

function deleteTask(taskId) {
    tasks = tasks.filter(task => task.id !== taskId);
    saveTasksToLocalStorage();
    renderTasks();
    updateTasksCounter();
}

function openEditModal(taskId) {
    const taskToEdit = tasks.find(task => task.id === taskId);
    if (!taskToEdit) return;
    
    currentEditTaskId = taskId;
    editTaskInput.value = taskToEdit.text;
    editModal.style.display = 'block';
    editTaskInput.focus();
}

function closeEditModal() {
    editModal.style.display = 'none';
    currentEditTaskId = null;
}

function saveTaskEdit() {
    if (!currentEditTaskId) return;
    
    const editedText = editTaskInput.value.trim();
    if (!editedText) return;
    
    tasks = tasks.map(task => {
        if (task.id === currentEditTaskId) {
            return { ...task, text: editedText };
        }
        return task;
    });
    
    saveTasksToLocalStorage();
    renderTasks();
    closeEditModal();
}

function handleTaskActions(e) {
    const taskItem = e.target.closest('.task-item');
    if (!taskItem) return;
    
    const taskId = taskItem.dataset.id;
    
    if (e.target.classList.contains('task-checkbox') || e.target.classList.contains('task-text')) {
        toggleTaskCompletion(taskId);
    } else if (e.target.classList.contains('edit-btn') || e.target.classList.contains('fa-edit')) {
        openEditModal(taskId);
    } else if (e.target.classList.contains('delete-btn') || e.target.classList.contains('fa-trash-alt')) {
        deleteTask(taskId);
    }
}


function clearCompletedTasks() {
    tasks = tasks.filter(task => !task.completed);
    saveTasksToLocalStorage();
    renderTasks();
    updateTasksCounter();
}


function handleFilterChange(e) {
    filterBtns.forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    
    currentFilter = e.target.dataset.filter;
    renderTasks();
}


function getFilteredTasks() {
    switch (currentFilter) {
        case 'active':
            return tasks.filter(task => !task.completed);
        case 'completed':
            return tasks.filter(task => task.completed);
        default:
            return tasks;
    }
}


function renderTasks() {
    const filteredTasks = getFilteredTasks();
    
    taskList.innerHTML = '';
    
    if (filteredTasks.length === 0) {
        const emptyMessage = document.createElement('li');
        emptyMessage.className = 'task-item empty-message';
        emptyMessage.textContent = currentFilter === 'all' 
            ? 'No tasks yet. Add a task to get started!' 
            : `No ${currentFilter} tasks found.`;
        taskList.appendChild(emptyMessage);
        return;
    }
    
    filteredTasks.forEach(task => {
        const taskItem = document.createElement('li');
        taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
        taskItem.dataset.id = task.id;
        
        taskItem.innerHTML = `
            <div class="task-content">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <span class="task-text">${task.text}</span>
            </div>
            <div class="task-actions">
                <button class="edit-btn" title="Edit task">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-btn" title="Delete task">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;
        
        taskList.appendChild(taskItem);
    });
}

// Update tasks counter
function updateTasksCounter() {
    const activeTasks = tasks.filter(task => !task.completed).length;
    tasksCounter.textContent = `${activeTasks} task${activeTasks !== 1 ? 's' : ''} left`;
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initialize);
