// Import helper functions from utils
import { getTasks, createNewTask } from './utils/taskFunctions.js';
import {initialData} from './initialData.js';

/*************************************************************************************************************************************************
 * FIX BUGS!!!
 * **********************************************************************************************************************************************/

// Function checks if local storage already has data, if not it loads initialData to localStorage
function initializeData() {
  if (!localStorage.getItem('tasks')) {
    localStorage.setItem('tasks', JSON.stringify(initialData));
    localStorage.setItem('showSideBar', 'true');
  } else {
    console.log('Data already exists in localStorage');
  }
}

// Get elements from the DOM
// Assuming helper functions and initial data are imported here
// import { getTasks, createNewTask, updateTask, toggleModal, openEditTaskModal, ... } from './utils';
// import initialData from './initialData';

// Elements from the DOM
const elements = {
  sideBar: document.getElementById('side-bar-div'),
  hideSideBarButton: document.getElementById('hide-side-bar-btn'),
  showSideBarButton: document.getElementById('show-side-bar-btn'),
  layout: document.getElementById('layout'),
  header: document.getElementById('header'),
  headerBoardName: document.getElementById('header-board-name'),
  dropdownBtn: document.getElementById('dropdownBtn'),
  addNewTaskButton: document.getElementById('add-new-task-btn'),
  editBoardButton: document.getElementById('edit-board-btn'),
  editBoardDiv: document.getElementById('editBoardDiv'),
  deleteBoardButton: document.getElementById('deleteBoardBtn'),

  todoColumn: document.querySelector('[data-status="todo"]'),
  todoHeadDiv: document.getElementById('todo-head-div'),
  todoDot: document.getElementById('todo-dot'),
  toDoText: document.getElementById('toDoText'),
  todoTasksContainer: document.querySelector('[data-status="todo"] .tasks-container'),

  doingColumn: document.querySelector('[data-status="doing"]'),
  doingHeadDiv: document.getElementById('doing-head-div'),
  doingDot: document.getElementById('doing-dot'),
  doingText: document.getElementById('doingText'),
  doingTasksContainer: document.querySelector('[data-status="doing"] .tasks-container'),

  doneColumn: document.querySelector('[data-status="done"]'),
  doneHeadDiv: document.getElementById('done-head-div'),
  doneDot: document.getElementById('done-dot'),
  doneText: document.getElementById('doneText'),
  doneTasksContainer: document.querySelector('[data-status="done"] .tasks-container'),

  newTaskModalWindow: document.getElementById('new-task-modal-window'),
  modalTitleInput: document.getElementById('title-input'),
  modalDescInput: document.getElementById('desc-input'),
  modalSelectStatus: document.getElementById('select-status'),
  createTaskButton: document.getElementById('create-task-btn'),
  cancelAddTaskButton: document.getElementById('cancel-add-task-btn'),

  editTaskModalWindow: document.querySelector('.edit-task-modal-window'),
  editTaskForm: document.getElementById('edit-task-form'),
  editTaskHeader: document.getElementById('edit-task-header'),
  editTaskTitleInput: document.getElementById('edit-task-title-input'),
  editTaskDescInput: document.getElementById('edit-task-desc-input'),
  editSelectStatus: document.getElementById('edit-select-status'),
  saveTaskChangesButton: document.getElementById('save-task-changes-btn'),
  cancelEditButton: document.getElementById('cancel-edit-btn'),
  deleteTaskButton: document.getElementById('delete-task-btn'),

  filterDiv: document.getElementById('filterDiv'),
};


let activeBoard = "";

// Extracts unique board names from tasks
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();
  const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];
  displayBoards(boards);
  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"));
    activeBoard = localStorageBoard ? localStorageBoard : boards[0]; 
    elements.headerBoardName.textContent = activeBoard;
    styleActiveBoard(activeBoard);
    refreshTasksUI();
  }
}

// Creates different boards in the DOM
function displayBoards(boards) {
  const boardsContainer = elements.boardsNavLinksDiv;
  boards.forEach(board => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");
    boardElement.onclick = () => {
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board; // Assigns active board
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard));
      styleActiveBoard(activeBoard);
    };
    boardsContainer.appendChild(boardElement);
  });
}

// Filters tasks corresponding to the board name and displays them on the DOM.
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks();
  const filteredTasks = tasks.filter(task => task.board === boardName);

  elements.todoTasksContainer.innerHTML = '';
  elements.doingTasksContainer.innerHTML = '';
  elements.doneTasksContainer.innerHTML = '';

  filteredTasks.forEach(task => {
    const taskElement = document.createElement("div");
    taskElement.classList.add("task-div");
    taskElement.textContent = task.title;
    taskElement.setAttribute('data-task-id', task.id);
    
    taskElement.onclick = () => {
      openEditTaskModal(task);
    };

    switch (task.status) {
      case 'todo':
        elements.todoTasksContainer.appendChild(taskElement);
        break;
      case 'doing':
        elements.doingTasksContainer.appendChild(taskElement);
        break;
      case 'done':
        elements.doneTasksContainer.appendChild(taskElement);
        break;
    }
  });
}

function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
}

// Styles the active board by adding an active class
function styleActiveBoard(boardName) {
  document.querySelectorAll('.board-btn').forEach(btn => {
    if (btn.textContent === boardName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

function addTaskToUI(task) {
  const column = document.querySelector(`.column-div[data-status="${task.status}"]`); 
  if (!column) {
    console.error(`Column not found for status: ${task.status}`);
    return;
  }

  const tasksContainer = column.querySelector('.tasks-container');
  
  const taskElement = document.createElement('div');
  taskElement.className = 'task-div';
  taskElement.textContent = task.title; 
  taskElement.setAttribute('data-task-id', task.id);
  
  taskElement.onclick = () => openEditTaskModal(task); // Allow editing on click

  tasksContainer.appendChild(taskElement); 
}

function setupEventListeners() {
  elements.cancelEditButton.onclick = () => toggleModal(false, elements.editTaskModalWindow);
  elements.cancelAddTaskButton.onclick = () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none';
  };

  elements.filterDiv.onclick = () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none';
  };

  elements.showSideBarButton.onclick = () => toggleSidebar(true);
  elements.hideSideBarButton.onclick = () => toggleSidebar(false);

  elements.addNewTaskButton.onclick = () => {
    toggleModal(true);
    elements.filterDiv.style.display = 'block';
  };

  elements.newTaskModalWindow.addEventListener('submit', (event) => {
    addTask(event);
  });
}

// Toggles tasks modal
function toggleModal(show, modal = elements.newTaskModalWindow) {
  modal.style.display = show ? 'block' : 'none'; 
}

function addTask(event) {
  event.preventDefault(); 

  const task = {
    title: elements.modalTitleInput.value,
    description: elements.modalDescInput.value,
    status: elements.modalSelectStatus.value,
    board: activeBoard,
  };

  const newTask = createNewTask(task);
  if (newTask) {
    addTaskToUI(newTask);
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; 
    event.target.reset();
    refreshTasksUI();
  }
}

function openEditTaskModal(task) {
  elements.editTaskTitleInput.value = task.title;
  elements.editTaskDescInput.value = task.description;
  elements.editSelectStatus.value = task.status;

  elements.saveTaskChangesButton.onclick = () => saveTaskChanges(task.id);
  toggleModal(true, elements.editTaskModalWindow);
}

function saveTaskChanges(taskId) {
  // Get new user inputs from modal elements
  const newTitle = elements.editTaskTitleInput.value;
  const newDescription = elements.editTaskDescInput.value;
  const newStatus = elements.editSelectStatus.value;

  // Create an object with the updated task details
  const updatedTask = {
    id: taskId, // Include the taskId to identify the task to be updated
    title: newTitle,
    description: newDescription,
    status: newStatus
  };

  // Close the modal and refresh the UI to reflect the changes
  toggleModal(false, elements.editTaskModalWindow);
  refreshTasksUI();
}


document.addEventListener('DOMContentLoaded', function() {
  init();
});

function init() {
  setupEventListeners();
  const showSidebar = localStorage.getItem('showSideBar') === 'true';
  toggleSidebar(showSidebar);
  fetchAndDisplayBoardsAndTasks();
}

function toggleSidebar(show) {
  elements.sideBar.style.display = show ? 'block' : 'none';
  localStorage.setItem('showSideBar', show);
}

