// const API_BASE_URL = window.API_BASE_URL;

const modal = document.getElementById('myModal');
const taskForm = document.getElementById('addTaskForm');
const taskNameInput = document.getElementById('taskName');
const taskDateInput = document.getElementById('taskDate');
const taskTypeInput = document.getElementById('taskType');
const modalTitle = document.getElementById('modal-title');
const submitButton = document.getElementById('submitButton');
const taskIDInput = document.getElementById('taskID');
const noteSaveButton = document.getElementById('noteSubmitButton');
const noteText = document.getElementById('noteText');
const noteView = document.getElementById('noteView');
const logoutButton = document.getElementById('btn-logout');

// Date input toggle
const taskDateButton = document.getElementById('dateButtonTgg');
let isChecked = false;
taskDateButton.addEventListener('change', (event) => {
    isChecked = event.target.checked;
    if (isChecked) {
        taskDateInput.classList.remove('hidden');
        const date = new Date();
        taskDateInput.value=`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,0)}-${String(date.getDate()).padStart(2,0)}`;
    } 
    else {
        taskDateInput.classList.add('hidden');
        taskDateInput.value='';
    }
});

async function fetchTasks() {
    try {
        const token = localStorage.getItem('token')
        const response = await fetch(`${window.API_BASE_URL}/api/tasks`,{
            headers:{
            'Authorization': `Bearer ${token}`
        }});
        const tasks = await response.json();
        
        // Clear existing lists
        document.getElementById('work-list').innerHTML = '';
        document.getElementById('learning-list').innerHTML = '';
        document.getElementById('life-list').innerHTML = '';
        document.getElementById('goals-list').innerHTML = '';
        
        tasks.forEach(task => {
            renderTask(task);
        });
        updateStats();
    } catch (error) {
        console.error('Error fetching tasks:', error);
    }
}

function renderTask(task) {
    const taskList = document.getElementById(`${task.type}-list`);
    if (!taskList) return;

    const li = document.createElement('li');
    li.className = 'task-item';
    li.dataset.id = task.id;
    li.setAttribute('draggable', 'true');

    const deadlineDate = task.deadline ? new Date(task.deadline).toISOString().substring(0, 10) : 'no-deadline';
    li.dataset.group = `${task.type}-${deadlineDate}`;


    let dateDisplay = '';
    if (task.deadline) {
        const daysRemaining = getDaysRemaining(task.deadline);
        const DaysPassed = getDaysPassed(task.deadline);
        if (daysRemaining < 0) {
            dateDisplay = `Đã quá hạn ${DaysPassed} ngày`;
        } else if (daysRemaining === 0) {
            dateDisplay = `Hôm nay`;
        } else {
            dateDisplay = `Còn ${daysRemaining} ngày`;
        }
    }
    
    li.innerHTML = `
        <input type="checkbox" class="task-item-checkbox" ${task.is_completed ? 'checked' : ''} onchange="toggleTaskCompletion(${task.id}, this.checked)">
        <span class="task-item-text ${task.is_completed ? 'line-through text-gray-400' : ''}">${task.name}</span>
        ${task.deadline ? `<span class="deadline">${dateDisplay}</span>` : ''}
        <button class="btn-delete" onclick="deleteTask(${task.id})">&#x2715;</button>
    `;
    li.querySelector('.task-item-text').addEventListener('click', () => openModalUpdate(task));
    if (task.deadline) {
        li.querySelector('.deadline').addEventListener('click', () => openModalUpdate(task));
    }

    li.addEventListener('dragstart', handleDragStart);
    li.addEventListener('dragend', handleDragEnd);
    li.addEventListener('dragover', handleDragOver);
    li.addEventListener('drop', handleDrop);

    taskList.addEventListener('dragover', handleDragOver);
    taskList.addEventListener('drop', handleDrop);

    taskList.appendChild(li);
}

async function fetchTaskInText(type) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${window.API_BASE_URL}/api/tasks?${type}`,{
            headers:{
            'Authorization': `Bearer ${token}`
        }});
        const tasks = await response.json();
        
        // Clear text
        document.getElementById(`${type}-raw-text`).value= '';
        
        let resultValue ='';
        tasks.forEach(task => {
            // renderTaskInText(task,type);
            let taskDateValue = null;
            if(task.deadline) {taskDateValue = new Date(task.deadline);}
            let string=`[${task.is_completed?'x':''}] ${task.name} ${taskDateValue?`(${taskDateValue.getDate()}/${taskDateValue.getMonth()+1}/${(taskDateValue.getFullYear())%100})`:''}`;
            resultValue += string +'\n';
        });
        document.getElementById(`${type}-raw-text`).value= resultValue;

    } catch (error) {
        console.error('Error fetching tasks:', error);
    }
}

let draggedItem = null; 
let placeholder = document.createElement('div');
placeholder.classList.add('placeholder');

function handleDragStart(e) {
    draggedItem = this; 
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => {
        this.classList.add('dragging');
        this.parentElement.insertBefore(placeholder, this.nextSibling); 
    }, 0); 
}

function handleDragOver(e) {
    e.preventDefault(); 
    e.dataTransfer.dropEffect = 'move';
    
    const targetItem = this;
    
    if (!draggedItem || draggedItem === targetItem) {
        return; 
    }
    
    if (draggedItem.dataset.group !== targetItem.dataset.group) {
        return; 
    }
    
    const list = targetItem.parentElement; 
    const afterElement = getDragAfterElement(list, e.clientY); // Hàm tìm vị trí

    if (afterElement === draggedItem) return;

    if (afterElement == null) {
        list.appendChild(placeholder);
    } else {
        list.insertBefore(placeholder, afterElement);
    }
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.task-item:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2; 

        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: -Infinity }).element;
}

function handleDragEnd() {
    this.classList.remove('dragging');
    draggedItem = null;
    
    // Xóa placeholder
    if (placeholder.parentElement) {
        placeholder.parentElement.removeChild(placeholder);
    }

    updateTaskOrder(this.parentElement.id); 
}

async function updateTaskOrder(listId) {
    const listElement = document.getElementById(listId);
    if (!listElement) return;

    const taskItems = listElement.querySelectorAll('.task-item');
    const newOrderIds = Array.from(taskItems).map(li => parseInt(li.dataset.id));
    
    if (newOrderIds.length === 0) return;

    // Lấy thông tin nhóm từ item đầu tiên
    const firstItem = taskItems[0];
    const [taskType, groupKey] = firstItem.dataset.group.split('-');

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${window.API_BASE_URL}/api/tasks/reorder`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                taskType: taskType,
                groupKey: groupKey,
                tasksIDList: newOrderIds 
            })
        });

        if (!response.ok) {
            fetchTasks(); 
            throw new Error('Failed to update task order');
        }
        
    } catch (error) {
        console.error('Error update task order:', error);
    }
}

/**
 * Xử lý khi item được thả (Drop).
 * @param {DragEvent} e 
 */
function handleDrop(e) {
    e.preventDefault(); 
    e.stopPropagation();

    if (draggedItem && placeholder.parentElement) {
        // Thay thế placeholder bằng item đang được kéo
        placeholder.parentElement.insertBefore(draggedItem, placeholder);
        placeholder.parentElement.removeChild(placeholder);
    }
}


// fetch note
async function fetchNote(){
    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${window.API_BASE_URL}/api/note`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
        });

        const note = await response.json();
        
        // Clear existing note
        document.getElementById('noteText').value = '';
        
        // console.log(note);
        renderNoteView(note);
        renderNote(note);
    } catch (error) {
        console.error('Error fetching note:', error);
    }
}

function renderNoteView(note){
    if (!(note[0])) return;
    const unsafeHTML = marked.parse(note[0].content);

    const safeHTML = DOMPurify.sanitize(unsafeHTML);
    
    noteView.innerHTML = safeHTML;
}

noteView.addEventListener('click', (e)=>{
    noteText.style.display='block';
    noteView.style.display='none';
});

function renderNote(note) {
    if (!(note[0])) return;
    document.getElementById('noteText').value = `${note[0].content}`;
}

// Update note
async function saveNoteText() {
    const noteContent = noteText.value;
    if(!noteContent) return;
    const token = localStorage.getItem("token");

    try {
        await fetch(`${window.API_BASE_URL}/api/note`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ content:noteContent })
        });
        fetchNote(); // Refresh note
        noteText.style.display='none';
        noteView.style.display='block';
    } catch (error) {
        console.error('Error adding note:', error);
    }
}
noteSaveButton.addEventListener('click',  (e) => {
    e.preventDefault();
    saveNoteText();
});
noteText.addEventListener('keydown', (e)=>{
    if(e.ctrlKey && e.key === 'Enter' && noteText.style.display==='block' ){
        e.preventDefault();
        saveNoteText();
    }
})

// Open Modal
function openModal(type) {
    modalTitle.textContent = 'Thêm nội dung mới';
    submitButton.textContent = 'Thêm';
    taskIDInput.value = ''; // Đặt id về rỗng
    taskNameInput.value = ''; // Xóa dữ liệu cũ
    taskDateInput.value = '';

    modal.style.display = 'flex';
    taskTypeInput.value = type;
}

// Close Modal
function closeModal() {
    modal.style.display = 'none';
    taskDateInput.classList.add('hidden');
    taskForm.reset();
}
modal.addEventListener('click',(e)=>{
    if(e.target===modal){
        closeModal();
    }
})
document.addEventListener('keydown',(e)=>{
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
        closeModal();
    }
})


// Open Modal Update
function openModalUpdate(task){
    modalTitle.textContent = 'Chỉnh sửa';
    submitButton.textContent = 'Lưu';
    taskIDInput.value = task.id; // Đặt id của task cần sửa
    taskNameInput.value = task.name; // Điền dữ liệu cũ vào form
    if (task.buttonChecked) {
        taskDateInput.classList.remove('hidden');
        taskDateButton.checked=true;
        const isoDate = task.deadline;
        const date = new Date(isoDate);

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        taskDateInput.value = `${year}-${month}-${day}`;
    }
    else{
        taskDateInput.classList.add('hidden');
        taskDateInput.value='';
    }

    modal.style.display = 'flex';
    taskTypeInput.value = task.type;
}

// Calculate days remaining
function getDaysRemaining(endDate) {
    const today = new Date();
    const end = new Date(endDate);
    const timeDifference = end.getTime() - today.getTime();
    const daysRemaining = Math.ceil(timeDifference / (1000 * 3600 * 24));
    return daysRemaining;
}

// Calculate days passed
function getDaysPassed(endDate) {
    const today = new Date();
    const end = new Date(endDate);
    const timeDifference = - end.getTime() + today.getTime();
    const DaysPassed = Math.ceil(timeDifference / (1000 * 3600 * 24));
    return DaysPassed;
}

// Handle form submission to add new task
taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const taskName = taskNameInput.value;
    const taskDate = taskDateInput.value;
    const taskType = taskTypeInput.value;
    const taskID = taskIDInput.value;
    
    try {
        const token = localStorage.getItem('token');
        if(taskID){
            await fetch(`${window.API_BASE_URL}/api/tasks/full/${taskID}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name: taskName, type: taskType, deadline: taskDate?taskDate:'1111-11-11' })
            });
        }
        else{
            await fetch(`${window.API_BASE_URL}/api/tasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                 },
                body: JSON.stringify({ name: taskName, type: taskType, deadline: taskDate?taskDate:'1111-11-11' })
            });
        }
        fetchTasks(); // Refresh list
        closeModal();
    } catch (error) {
        console.error('Error adding task:', error);
    }
});

// Delete a task
async function deleteTask(id) {
    try {
        const token = localStorage.getItem('token');
        await fetch(`${window.API_BASE_URL}/api/tasks/${id}`, { 
            method: 'DELETE',
            headers:{
            'Authorization': `Bearer ${token}`}
         });
        fetchTasks(); // Refresh list
    } catch (error) {
        console.error('Error deleting task:', error);
    }
}

// Toggle task completion
async function toggleTaskCompletion(id, is_completed) {
    try {
        const token = localStorage.getItem('token');
        await fetch(`${window.API_BASE_URL}/api/tasks/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
             },
            body: JSON.stringify({ is_completed })
        });
        fetchTasks(); // Refresh list
    } catch (error) {
        console.error('Error updating task:', error);
    }
}

function changeTextView(type){
    const listInterface = document.getElementById(`${type}-list-interface`);
    const taskRawTextField = document.getElementById(`${type}-raw-text`);
    const taskRawTextInterface = document.getElementById(`${type}-taskRawTextInterface`);
    const taskRawTextSubmitButton = document.getElementById(`${type}-taskRawTextSubmitButton`);
    listInterface.style.display = 'none';
    taskRawTextInterface.style.display = 'block';

    fetchTaskInText(type);

    taskRawTextSubmitButton.addEventListener('click', saveTaskTextByClick);
    taskRawTextField.addEventListener('keydown', saveTaskTextByCtrlEnter);

    function saveTaskTextByClick(e) {
        e.preventDefault();
        saveTaskText(type);
    
        taskRawTextSubmitButton.removeEventListener('click', saveTaskTextByClick);
        taskRawTextField.removeEventListener('keydown', saveTaskTextByCtrlEnter);
    }
    
    function saveTaskTextByCtrlEnter(e) {
        if (e.ctrlKey && e.key === 'Enter' && taskRawTextInterface.style.display === 'block') {
            e.preventDefault();
            saveTaskText(type);
    
            taskRawTextSubmitButton.removeEventListener('click', saveTaskTextByClick);
            taskRawTextField.removeEventListener('keydown', saveTaskTextByCtrlEnter);
        }
    }
}


async function saveTaskText(type) {
    const taskRawText = document.getElementById(`${type}-raw-text`);
    const taskRawTextValue = taskRawText.value;
    const token = localStorage.getItem('token');
    try {
        if(1){
            await fetch(`${window.API_BASE_URL}/api/tasks/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ rawText:taskRawTextValue, type})
            });

        }
        closeTextView(type);
        fetchTasks(); // Refresh list
    } catch (error) {
        console.error('Error adding task:', error);
    }
}

function closeTextView(type){
    const listInterface = document.getElementById(`${type}-list-interface`);
    const taskRawTextInterface = document.getElementById(`${type}-taskRawTextInterface`);
    listInterface.style.display = 'block';
    taskRawTextInterface.style.display = 'none';   
}

// Update statistics
function updateStats() {
    const total = document.querySelectorAll('.task-list .task-item').length;
    const deadlines = document.querySelectorAll('.task-list .task-item .deadline').length;
    const worksToDo = document.querySelectorAll('#work-list .task-item').length;
    const needToLearn = document.querySelectorAll('#learning-list .task-item').length;
    const tasksToDo = document.querySelectorAll('#life-list .task-item').length;
    const currentGoals = document.querySelectorAll('#goals-list .task-item').length;

    document.getElementById('total-stats').textContent = total;
    document.getElementById('deadlines').textContent = deadlines;
    document.getElementById('works-to-do').textContent = worksToDo;
    document.getElementById('need-to-learn').textContent = needToLearn;
    document.getElementById('tasks-to-do').textContent = tasksToDo;
    document.getElementById('current-goals').textContent = currentGoals;
}

async function getUsername(){
    try{
        const token = localStorage.getItem('token')
        const response = await fetch(`${window.API_BASE_URL}/api/users`,{
            headers:{
            'Authorization': `Bearer ${token}`
        }});
        const user = await response.json();
        const username = user.username;

        return username;

    }
    catch (err){
        console.log('error get username: ', err);
    }
}

async function displayUsername(){
    const username = await getUsername();

    logoutButton.textContent= username;
    logoutButton.style.backgroundColor= 'white';
    logoutButton.style.color= 'black';
    
    logoutButton.addEventListener('mouseover', e =>{
        logoutButton.style.transform = "scale(1.1)";
        logoutButton.textContent= 'Đăng xuất';
        logoutButton.style.backgroundColor= 'hsl(122, 39%, 45%)';
        logoutButton.style.color= 'white';
    })
    logoutButton.addEventListener('mouseout', e =>{
        logoutButton.style.transform = "scale(1)";
        logoutButton.textContent= username;
        logoutButton.style.backgroundColor= 'white';
        logoutButton.style.color= 'black';
    })
}

async function fetchStarRepo() {
    try{
        const response= await fetch("https://api.github.com/repos/b1nhan/myDashboard");
        const content = await response.json();
        const starCouting = document.getElementById('star-counting');
        starCouting.textContent= content.stargazers_count;
    }
    catch(err){
        console.log('error get stargazers count ', err);
    }
}

document.addEventListener('DOMContentLoaded', ()=>{
    if (!isLoggedIn()) {
    redirectToLogin();
    console.log('please loggin');
  } else {
    // Nếu đã đăng nhập, tải dữ liệu tasks từ API
    displayUsername();
    fetchTasks();
    fetchNote();
    fetchStarRepo();
  }
});

// random line