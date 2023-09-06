import {
    saveTask, 
    getTasks, 
    onGetTasks, 
    deleteTask, 
    getTask,
    updateTask
} from "./firebase.js"

const taskForm = document.getElementById('task-form');
const tasksContainer = document.getElementById('tasks-container');

let editStatus = false;
let id = '';

window.addEventListener('DOMContentLoaded', async () =>{
    onGetTasks((querySnapshot) => {
        tasksContainer.innerHTML = '';
        
        let html = "";

        querySnapshot.forEach(doc => {
        const task = doc.data()
        html += `
            <div class="d-flex" style="margin: 5px;">
                <h5 class="col-md-4">${task.name}</h5>
                <h5 class="col-md-4">${task.description}</h5>
                <h5 class="col-md-1">${task.stock}</h5>
                <h5 class="col-md-1">${task.precio}</h5>
                <button class ='btn-delete btn btn-outline-danger' data-id="${doc.id}">Delete</button>
                <button class ='btn-edit btn btn-outline-primary' data-id="${doc.id}" style="margin-left: 10px;">Edit</button>
            </div>
        `;
        });

        tasksContainer.innerHTML = html;

        const btnDelete = tasksContainer.querySelectorAll('.btn-delete')

        btnDelete.forEach(btn => {
            btn.addEventListener('click', ({target: {dataset}}) => {
                deleteTask(dataset.id)
            });
        });
        
        const btnEdit = tasksContainer.querySelectorAll('.btn-edit')
        btnEdit.forEach(btn => {
            btn.addEventListener('click', async (e) =>{
                console.log(e.target.dataset.id)
                const doc = await getTask(e.target.dataset.id)
                const task = doc.data()

                taskForm['task-name'].value = task.name
                taskForm['task-description'].value = task.description
                taskForm['task-stock'].value = task.stock
                taskForm['task-precio'].value = task.precio


                editStatus = true;
                id = doc.id;

                taskForm["btn-task-save"].innerText = 'Update'
            })
        });
    });
});

taskForm.addEventListener("submit", (e) => {
    e.preventDefault()

    const name = taskForm['task-name']
    const description = taskForm['task-description']
    const stock = taskForm['task-stock']
    const precio = taskForm['task-precio']

    if (!editStatus){
        saveTask(name.value, description.value, parseFloat(precio.value), parseFloat(stock.value))
    }else{
        updateTask(id,{
            name: name.value,
            description: description.value,
            stock: parseFloat(stock.value),
            precio: parseFloat(precio.value)
        });

        editStatus = false;
        taskForm["btn-task-save"].innerText = 'Save'
    }

    taskForm.reset();

});