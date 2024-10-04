// Importing helper functions from utils
import { getTasks, createNewTask, patchTask, putTask, deleteTask } from './utils/taskFunctions.js';
import { initialData } from './initialData.js';

// TASK: import helper functions from utils
// TASK: import initialData


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

// TASK: Get elements from the DOM

// Added element retrieval
const elements = {
  headerBoardName: document.getElementById('header-board-name'),
  columnDivs: document.querySelectorAll('.column-div'),
  filterDiv: document.getElementById('filterDiv'),
  createNewTaskBtn: document.getElementById('add-new-task-btn'),
  cancelAddTaskBtn: document.getElementById('cancel-add-task-btn'),
  hideSideBarBtn: document.getElementById('hide-side-bar-btn'),
  showSideBarBtn: document.getElementById('show-side-bar-btn'),
  themeSwitch: document.getElementById('switch'),
  editTaskModal: document.querySelector('.edit-task-modal-window'),
  modalWindow: document.getElementById('new-task-modal-window'),
};

// Initialize active board variable
let activeBoard = "";

// Extracts unique board names from tasks
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();
  const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];
  displayBoards(boards);
  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"));
    activeBoard = localStorageBoard ? localStorageBoard : boards[0];  // Fixed the assignment
    elements.headerBoardName.textContent = activeBoard;
    styleActiveBoard(activeBoard);
    refreshTasksUI();
  }
}

// Creates different boards in the DOM
// TASK: Fix Bugs
function displayBoards(boards) {
  const boardsContainer = document.getElementById("boards-nav-links-div");
  boardsContainer.innerHTML = ''; // Clears the container
  boards.forEach(board => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");
    boardElement.onclick = () => { // Changed from click() to onclick
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board; // assigns active board
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard));
      styleActiveBoard(activeBoard);
    };
    boardsContainer.appendChild(boardElement);
  });
}

// Filters tasks corresponding to the board name and displays them on the DOM.
// TASK: Fix Bugs
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks(); // Fetch tasks from a simulated local storage function
  const filteredTasks = tasks.filter(task => task.board === boardName); // Fixed assignment to equality check

  elements.columnDivs.forEach(column => {
    const status = column.getAttribute("data-status");
    // Reset column content while preserving the column title
    column.innerHTML = `<div class="column-head-div">
                        <span class="dot" id="${status}-dot"></span>
                        <h4 class="columnHeader">${status.toUpperCase()}</h4>
                      </div>`;

  const tasksContainer = document.createElement("div");
  column.appendChild(tasksContainer);

  filteredTasks.filter(task => task.status === status).forEach(task => { // Fixed assignment to equality check
    const taskElement = document.createElement("div");
    taskElement.classList.add("task-div");
    taskElement.textContent = task.title;
    taskElement.setAttribute('data-task-id', task.id);

    // Listen for a click event on each task and open a modal
    taskElement.onclick = () => { // Changed from click() to onclick
      openEditTaskModal(task);
    };

    tasksContainer.appendChild(taskElement);
  });
});
}

function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
}

// Styles the active board by adding an active class
// TASK: Fix Bugs
function styleActiveBoard(boardName) {
  document.querySelectorAll('.board-btn').forEach(btn => { // Changed foreach to forEach
    if (btn.textContent === boardName) {
      btn.classList.add('active'); // Changed add() to classList.add()
    } else {
      btn.classList.remove('active'); // Changed remove() to classList.remove()
    }
  });
}

function addTaskToUI(task) {
  const column = document.querySelector(`.column-div[data-status="${task.status}"]`);
  if (!column) {
    console.log(task.status);
    return;
  }

  // Create the first task element
  const taskElement1 = document.createElement('div');
  taskElement1.classList.add('task');
  taskElement1.textContent = task.title; // Assuming task has a title property
  column.appendChild(taskElement1);

  // Create the second task element
  const taskElement2 = document.createElement('div');
  taskElement2.className = 'task-div';
  taskElement2.textContent = task.title; // Modify as needed
  taskElement2.setAttribute('data-task-id', task.id);
  
  // Assuming you have a container to append the second task element to
  const tasksContainer = document.querySelector('.tasks-container'); // Adjust selector as needed
  tasksContainer.appendChild(taskElement2);
}

function setupEventListeners() {
  // Cancel editing task event listener
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  cancelEditBtn.onclick = () => toggleModal(false, elements.editTaskModal); // Changed from click() to onclick

  // Cancel adding new task event listener
  const cancelAddTaskBtn = document.getElementById('cancel-add-task-btn');
  cancelAddTaskBtn.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Clicking outside the modal to close it
  elements.filterDiv.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Show sidebar event listener
  elements.hideSideBarBtn.onclick = () => toggleSidebar(false); // Changed from click() to onclick
  elements.showSideBarBtn.onclick = () => toggleSidebar(true); // Changed from click() to onclick

  // Theme switch event listener
  elements.themeSwitch.addEventListener('change', toggleTheme);

  // Show Add New Task Modal event listener
  elements.createNewTaskBtn.addEventListener('click', () => {
    toggleModal(true);
    elements.filterDiv.style.display = 'block'; // Also show the filter overlay
  });

  // Add new task form submission event listener
  elements.modalWindow.addEventListener('submit', (event) => {
    addTask(event);
  });
}

// Toggles tasks modal
// Task: Fix bugs
function toggleModal(show, modal = elements.modalWindow) {
  modal.style.display = show ? 'block' : 'none'; // Fixed ternary operator syntax
}


function addTask(event) {
  event.preventDefault(); 

  //Assign user input to the task object
  const task = {
    title: event.target.title.value, // Assuming you have an input with name "title"
    status: 'default', // Adjust as needed
    board: activeBoard,
    id: Date.now(), // Example of generating an ID
  };
  const newTask = createNewTask(task);
  if (newTask) {
    addTaskToUI(newTask);
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
    event.target.reset();
    refreshTasksUI();
  }
}

// Placeholder for toggling sidebar
function toggleSidebar(show) {
  const sidebar = document.getElementById('side-bar-div');
  
}

// Placeholder for toggling theme
function toggleTheme() {
  document.body.classList.toggle('light-theme');
}

// Opens the edit task modal
function openEditTaskModal(task) {
  // Populate modal inputs with task details
  document.getElementById('edit-task-title-input').value = task.title;
  document.getElementById('edit-task-desc-input').value = task.description;
  document.getElementById('edit-select-status').value = task.status;


  toggleModal(true, elements.editTaskModal);
}

// Save changes to the task

/*************************************************************************************************************************************************/

document.addEventListener('DOMContentLoaded', function() {
  initializeData(); // Ensure data is initialized
  setupEventListeners();
  const showSidebar = localStorage.getItem('showSideBar') === 'true';
  toggleSidebar(showSidebar);
  const isLightTheme = localStorage.getItem('light-theme') === 'enabled';
  document.body.classList.toggle('light-theme', isLightTheme);
  fetchAndDisplayBoardsAndTasks();
});

function init() {
  setupEventListeners();
  const showSidebar = localStorage.getItem('showSideBar') === 'true';
  toggleSidebar(showSidebar);
  const isLightTheme = localStorage.getItem('light-theme') === 'enabled';
  document.body.classList.toggle('light-theme', isLightTheme);
  fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
}