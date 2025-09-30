
// Dom elements
const taskInput = document.querySelector('#taskDes');
const dateInput = document.querySelector('#Date');
const addBtn = document.querySelector('.addTask');
const taskList = document.querySelector('.taskList');

const allBtn = document.querySelector('.all');
const activeBtn = document.querySelector('.active');
const completedBtn = document.querySelector('.completed');

const sortByDateBtn = document.querySelector('.sortByDate');

const filterButtons = document.querySelectorAll('.filterSection .controlBtn');

let tasks = [];
let filter = 'all';

// initial event listener 
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        filterButtons.forEach(btn => btn.classList.remove('active-filter'));
        button.classList.add('active-filter');
    });
});

// local storage functions
function getTask() {
    const taskFromStorage = localStorage.getItem('tasks');
    return taskFromStorage ? JSON.parse(taskFromStorage) : [];
}

function saveTasks(task) {
    const jsonString = JSON.stringify(task);
    localStorage.setItem('tasks', jsonString);
}

// render and display functions
function renderTasks() {
    taskList.innerHTML = '';
    const filteredTasks = filterTasks(tasks, filter);
    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = 'taskItem';
        if (task.completed) {
            li.classList.add('completed');
        }
        li.dataset.id = task.id;

        li.innerHTML = ` <div class="taskContent">
        <span class="taskText">${task.text}</span>
        ${task.dueDate ? `<span class="dueDate">Date: ${task.dueDate}</span>` : ''}
    </div>
    <div class="taskActions">
        <button class="completeBtn">✔️</button>
        <button class="deleteBtn">❌</button>
    </div>
        `;
        taskList.appendChild(li);
    });
}

//  task management functions
function addTask() {
    const taskDes = taskInput.value.trim();
    const taskDate = dateInput.value;
    if (taskDes === '' && taskDate === '') {
        alert('Please enter both task description and date.');
        return;
    }
    else if (taskDes === '') {
        alert('Please enter a task description.');
        return;
    }
    else if (taskDate === '') {
        alert('Please enter a date.');
        return;
    }
    const newTask = {
        text: taskDes,
        dueDate: taskDate,
        completed: false,
        id: Date.now()
    };
    tasks.push(newTask);
    saveTasks(tasks);
    renderTasks();
    taskInput.value = '';
    dateInput.value = '';
}

function filterTasks(tasks, filter) {
    switch (filter) {
        case 'active':
            return tasks.filter(task => !task.completed);
        case 'completed':
            return tasks.filter(task => task.completed);
        case 'all':
        default:
            return tasks;
    }
}

function sortTasks(tasks) {
    tasks.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
    });
    saveTasks(tasks);
    renderTasks();
}

// Api fetch function
async function fetchInitialTasks() {
    if (tasks.length > 0) {
        return;
    }
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/todos?_limit=5');
        if (!response.ok) {
            throw new Error(`Internet error: ${response.status}`);
        }
        const apiTasks = await response.json();

        const formattedTasks = apiTasks.map(apiTask => ({
            text: apiTask.title,
            dueDate: '',
            completed: apiTask.completed,
            id: Date.now() + Math.random()
        }));

        tasks.push(...formattedTasks);
        saveTasks(tasks);
        renderTasks();
    } catch (error) {
        console.error('Failed to load tasks from API:', error);
        alert('Failed to load initial tasks. Please try refreshing the page.');
    }
}

// Event Handlers
function handleTaskListClick(event) {
    const target = event.target;
    const taskItem = target.closest('.taskItem');
    if (!taskItem) return;

    const taskId = Number(taskItem.dataset.id);

    if (target.classList.contains('completeBtn')) {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            saveTasks(tasks);
            renderTasks();
        }
    }

    if (target.classList.contains('deleteBtn')) {
        tasks = tasks.filter(t => t.id !== taskId);
        saveTasks(tasks);
        renderTasks();
    }
}

// Event Listeners
addBtn.addEventListener('click', addTask);

allBtn.addEventListener('click', () => {
    filter = 'all';
    renderTasks();
});

completedBtn.addEventListener('click', () => {
    filter = 'completed';
    renderTasks();
});

activeBtn.addEventListener('click', () => {
    filter = 'active';
    renderTasks();
});

sortByDateBtn.addEventListener('click', () => sortTasks(tasks));

taskList.addEventListener('click', handleTaskListClick);

// Initialize app
function initializeApp() {
    tasks = getTask();
    fetchInitialTasks();
    renderTasks();
    document.querySelector('.all').classList.add('active-filter');
}

document.addEventListener('DOMContentLoaded', initializeApp);