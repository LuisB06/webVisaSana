import { saveUser, getByEmail, updateUser, onGetUsers, getUser, deleteUser } from "./firebase.js";
import { bcrypt } from "./bcrypt.js";

const loadUserToForm = (data_user, btn_submit)=>{
    const btn_update = document.querySelectorAll(".btn-edit");

    btn_update.forEach(item=>{
        item.addEventListener("click",async ({target: {dataset}})=>{
            const user = (await getUser(dataset.id)).data();
            data_user.id.value=dataset.id;
            data_user.name.value=user.name;
            data_user.lastname.value=user.lastname;
            data_user.email.value=user.email;
            data_user.role.value=user.role;
            data_user.address.value=user.address;
            data_user.action.value="2";
            btn_submit.innerHTML="Update";
            data_user.password.removeAttribute("required");
        });
    });
}

const deleteUserEvent = ()=>{
    const btn_delete= document.querySelectorAll(".btn-delete");

    btn_delete.forEach(item=>{
        item.addEventListener("click",({target: {dataset}})=>{
            if(confirm("¿Esta seguro que desea eliminar el Usuario?")) deleteUser(dataset.id);
        });
    });
}

const showUsers = (data_user,btn_submit)=>{
    const user_container = document.getElementById("user-container");

    onGetUsers((snapshot)=>{
        let html = "";

        snapshot.forEach(item=>{
            const user = item.data();

            html+=/*html*/`
                <tr>
                    <td>${user.name}</td>
                    <td>${user.lastname}</td>
                    <td>${user.email}</td>
                    <td>${user.role==="A"?"Jefe":"Empleado"}</td>
                    <td>${user.address}</td>
                    <td>
                        <button class ='btn-delete btn btn-outline-danger' data-id="${item.id}">Delete</button>
                        <button class ='btn-edit btn btn-outline-primary' data-id="${item.id}" style="margin-left: 10px;">Edit</button>
                    </td>
                </tr>
            `;
        });

        user_container.innerHTML=html;
        loadUserToForm(data_user,btn_submit);
        deleteUserEvent();
    });
};

window.addEventListener("DOMContentLoaded",()=>{
    const fm = document.getElementById("fm");
    const data_user = {
        id: document.getElementById("id"),
        name: document.getElementById("name"),
        lastname: document.getElementById("lastname"),
        email: document.getElementById("email"),
        password: document.getElementById("password"),
        address: document.getElementById("address"),
        role: document.getElementById("role"),
        action: document.getElementById("action")
    }
    const btn_submit = document.getElementById("btn-submit");

    fm.addEventListener("submit",async (e)=>{
        e.preventDefault();

        try {
            const id = data_user.id.value;
            const email = data_user.email.value;
            const password = (data_user.password.value.trim()!=="")? bcrypt.hashSync(data_user.password.value,4):undefined;
            const users_email = await getByEmail(email);
            let exists_email = false;

            users_email.forEach(item => {
                const data_user_email = item.data().email;

                if(id!==item.id && data_user_email===email) exists_email=true;
            });
            if(exists_email){alert("El email ingresado ya existe, por favor verifique la información"); return;}

            if(data_user.action.value==="1") { 
                await saveUser(
                    data_user.name.value,
                    data_user.lastname.value,
                    email,
                    password,
                    data_user.role.value,
                    data_user.address.value
                );
                fm.reset();

                return;
            }

            await updateUser(
                data_user.id.value,
                data_user.name.value,
                data_user.lastname.value,
                data_user.email.value,
                data_user.role.value,
                data_user.address.value,
                password
            );
            btn_submit.innerHTML="Save";
            data_user.password.setAttribute("required","true");
            data_user.action.value="1";
            fm.reset();
        } catch (e) {
            alert("Ha ocurrido un error al intentar preocesar el usuario, por favor contactese con el administrador.");
            console.log(e);
        }
    });

    showUsers(data_user,btn_submit);
});