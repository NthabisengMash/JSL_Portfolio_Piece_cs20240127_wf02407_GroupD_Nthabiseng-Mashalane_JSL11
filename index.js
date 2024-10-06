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
    activeBoard = JSON.parse(localStorage.getItem("activeBoard")) || boards[0];
    elements.headerBoardName.textContent = activeBoard;
    styleActiveBoard(activeBoard);
    refreshTasksUI();
  }
}

// Creates different boards in the DOM
function displayBoards(boards) {
  const boardsContainer = document.getElementById("boards-nav-links-div");
  boardsContainer.innerHTML = ''; // Clears the container
  boards.forEach(board => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");

    // FIX BUG: Corrected the 'click' event listener to 'addEventListener'
    boardElement.addEventListener('click', () => {
      elements.headerBoardName.textContent = board;
      activeBoard = board; // Assigns active board
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard));
      styleActiveBoard(activeBoard);
      refreshTasksUI();
    });

    boardsContainer.appendChild(boardElement);
  });
}

// Filters tasks corresponding to the board name and displays them on the DOM
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks(); 

   // FIX BUG: Corrected the assignment to strict equality check (===) instead of a single (=)
  const filteredTasks = tasks.filter(task => task.board === boardName);

  [elements.todoColumn, elements.doingColumn, elements.doneColumn].forEach(column => {
    const status = column.getAttribute("data-status");
    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${status.toUpperCase()}</h4>
                        </div>`;

    const tasksContainer = document.createElement("div");
    column.appendChild(tasksContainer);

    // FIX BUG: Corrected another assignment to strict equality check (===)
    filteredTasks.filter(task => task.status === status).forEach(task => { 
      const taskElement = document.createElement("div");
      taskElement.classList.add("task-div");
      taskElement.textContent = task.title;
      taskElement.setAttribute('data-task-id', task.id);

      // FIX BUG: Corrected the 'click' event listener to 'addEventListener'
      taskElement.addEventListener('click', () => { 
        openEditTaskModal(task);
      });

      tasksContainer.appendChild(taskElement);
    });
  });
}

function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
}

// Styles the active board by adding an active class
function styleActiveBoard(boardName) {
  document.querySelectorAll('.board-btn').forEach(btn => { // FIX BUG: Corrected 'foreach' to 'forEach'

    if (btn.textContent === boardName) {
      btn.classList.add('active'); // FIX BUG: Added 'classList.' before 'remove'
    } else {
      btn.classList.remove('active'); // FIX BUG: Added 'classList.' before 'remove'
    }
  });
}

function addTaskToUI(task) {
  const column = document.querySelector(`.column-div[data-status="${task.status}"]`); 
  if (!column) {
    console.error(`Column not found for status: ${task.status}`);
    return;
  }

  let tasksContainer = column.querySelector('.tasks-container');
  if (!tasksContainer) {
    console.warn(`Tasks container not found for status: ${task.status}, creating one.`);
    tasksContainer = document.createElement('div');
    tasksContainer.className = 'tasks-container';
    column.appendChild(tasksContainer);
  }

  const taskElement = document.createElement('div');
  taskElement.className = 'task-div';
  taskElement.textContent = task.title; 
  taskElement.setAttribute('data-task-id', task.id);
  
  tasksContainer.appendChild(taskElement); // FIX BUG: Added taskElement inside appendChild
}

function setupEventListeners() {
  // Cancel editing task event listener
  // FIX BUG: Corrected 'click()' to 'addEventListener' and arrow function syntax
  elements.cancelEditButton.addEventListener('click', () => toggleModal(false, elements.editTaskModalWindow));

  // Cancel adding new task event listener
  elements.cancelAddTaskButton.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none';
  });

  // Clicking outside the modal to close it
  elements.filterDiv.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none';
  });

  // Show sidebar event listener
  // FIX BUG: Corrected 'click()' to 'addEventListener' and arrow function syntax
  elements.hideSideBarButton.addEventListener('click', () => toggleSidebar(false));
  elements.showSideBarButton.addEventListener('click', () => toggleSidebar(true));

  // Show Add New Task Modal event listener
  elements.addNewTaskButton.addEventListener('click', () => {
    toggleModal(true);
    elements.filterDiv.style.display = 'block';
  });

  // Add new task form submission event listener
  elements.newTaskModalWindow.addEventListener('submit', (event) => {
    addTask(event);
  });
}

// Toggles tasks modal
function toggleModal(show, modal = elements.newTaskModalWindow) {
  // FIX BUG: Corrected arrow function syntax in ternary operator
  modal.style.display = show ? 'block' : 'none'; 
}

/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/

function addTask(event) {
  event.preventDefault(); 

  // Assign user input to the task object
  const task = {
    title: elements.modalTitleInput.value,
    description: elements.modalDescInput.value,
    status: elements.modalSelectStatus.value,
    board: activeBoard,
    id: Date.now(), 
  };
  
  const newTask = createNewTask(task);
  if (newTask) {
    addTaskToUI(newTask);
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; 
    elements.newTaskModalWindow.reset();
    refreshTasksUI();
  }
}

function toggleSidebar(show) {
  elements.sideBar.style.display = show ? 'block' : 'none';
}

function openEditTaskModal(task) {
  // Set task details in modal inputs
  elements.editTaskTitleInput.value = task.title;
  elements.editTaskDescInput.value = task.description;
  elements.editSelectStatus.value = task.status;

  // Call saveTaskChanges upon click of Save Changes button
  elements.saveTaskChangesButton.onclick = () => {
    saveTaskChanges(task.id);
  };

  // Delete task using a helper function and close the task modal
  elements.deleteTaskButton.onclick = () => {
    deleteTask(task.id);
    toggleModal(false, elements.editTaskModalWindow);
  };

  toggleModal(true, elements.editTaskModalWindow); // Show the edit task modal
}

function saveTaskChanges(taskId) {
  // Implemented task update functionality
  const updatedTask = {
    id: taskId,
    title: elements.editTaskTitleInput.value,
    description: elements.editTaskDescInput.value,
    status: elements.editSelectStatus.value
  };

  // Close the modal and refresh the UI
  toggleModal(false, elements.editTaskModalWindow);
  refreshTasksUI();
}

 //Implemented task update functionality
function deleteTask(taskId) {
  const tasks = getTasks().filter(task => task.id !== taskId);
  localStorage.setItem('tasks', JSON.stringify(tasks));
  refreshTasksUI();
}

/*************************************************************************************************************************************************/

document.addEventListener('DOMContentLoaded', function() {
  init(); // init is called after the DOM is fully loaded
});

function init() {
  setupEventListeners();
  const showSidebar = localStorage.getItem('showSideBar') === 'true';
  toggleSidebar(showSidebar);
  const isLightTheme = localStorage.getItem('light-theme') === 'enabled';
  document.body.classList.toggle('light-theme', isLightTheme);
  initializeData(); // Initialize data on load
  fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
}
