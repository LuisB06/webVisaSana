import {
    saveTask, 
    onGetTasks, 
    deleteTask, 
    getTask,
    updateTask
} from "./firebase.js"

const taskForm = document.getElementById('task-form');
const tasksContainer = document.getElementById('list_products');

let editStatus = false;
let id = '';

const build_btn_delete=()=>{
    const btnDelete = tasksContainer.querySelectorAll('.btn-delete')

    btnDelete.forEach(btn => {
        btn.addEventListener('click', ({target: {dataset}}) => {
            deleteTask(dataset.id)
        });
    });
}

const build_btn_edit=()=>{
    const btnEdit = tasksContainer.querySelectorAll('.btn-edit')
    btnEdit.forEach(btn => {
        btn.addEventListener('click', async (e) =>{
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
}

const build_table=(list_produts,element_list_products)=>{
    let html="";

    list_produts.forEach((task,index)=>{
        html+=/*html */`
            <tr>
                <td>${task.name}</td>
                <td>${task.description}</td>
                <td>${task.stock}</td>
                <td>${task.precio}</td>
                <td>
                    <button class ='btn-delete btn btn-outline-danger' data-id="${task.id}">Delete</button>
                    <button class ='btn-edit btn btn-outline-primary' data-id="${task.id}" style="margin-left: 10px;">Edit</button>
                </td>
            </tr>
        `
    });

    element_list_products.innerHTML=html;
    build_btn_delete();
    build_btn_edit();
}

const filter_by_name_description=(list_products,input_search_element)=>{
    const searching_value=input_search_element.value;
    let array_filter=[];

    if(searching_value==="") return list_products;
    array_filter=list_products.filter(item=>item.name.toLowerCase().includes(searching_value.toLowerCase()) || item.description.toLowerCase().includes(searching_value.toLowerCase()));

    return array_filter;
}

window.addEventListener('DOMContentLoaded', async () =>{
    let list_products=[];
    const input_search=document.getElementById("input-search");
    const btn_clean=document.getElementById("btn-clean");
    const header_list_products=document.getElementById("header_list_products");
    const th = header_list_products.querySelectorAll("th");

    onGetTasks((querySnapshot) => {
        list_products=[];

        querySnapshot.forEach(doc => {
            const task = doc.data();

            list_products.push({
                id: doc.id,
                ...task
            });
        });

        build_table(filter_by_name_description(list_products,input_search),tasksContainer);
    });

    input_search.addEventListener("keyup",()=>{
        build_table(filter_by_name_description(list_products,input_search),tasksContainer);
    });

    btn_clean.addEventListener("click",()=>{
        input_search.value="";
        build_table(filter_by_name_description(list_products,input_search),tasksContainer);
    });

    th.forEach(item=>{
        item.addEventListener("click",(e)=>{
            const target=e.target;
            const list_class=target.classList;
            const asc=list_class.contains("asc");
            const data_key=target.dataset.key;

            if(typeof(data_key)==="undefined" || data_key===null) return;

            th.forEach(item=>{
                item.removeAttribute("style");
                item.classList.remove("asc");
                item.classList.remove("desc");
            });
            if(asc) {
                list_class.remove("asc");
                list_class.add("desc");
            } else {
                list_class.remove("desc");
                list_class.add("asc");
            }
            target.style.backgroundColor="#D4D4D4";

            const sort_list_products = filter_by_name_description(list_products,input_search).sort((a,b)=>{
                const element_a=a[data_key];
                const element_b=b[data_key];

                if(typeof(element_a)!=="string" || typeof(element_b)!=="string") {
                    const number_element_a=parseFloat(element_a);
                    const number_element_b=parseFloat(element_b);

                    if(isNaN(number_element_a) || isNaN(number_element_b)) return;

                    return number_element_a-number_element_b;
                }
                
                return element_a.trim().localeCompare(element_b.trim());
            });
            
            build_table(asc?sort_list_products.reverse():sort_list_products,tasksContainer);
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