import { getUser } from "./firebase.js";
import { logout } from "./fn-logout.js";

$.blockUI({
    message:/*html*/`
        <div class='container-blockui'>
            <div class='loader-blockui' role='status'></div>
        </div>`,
    css:{ border:"0"}
});

const  login_validation=async ()=>{
    const storage_user = sessionStorage.getItem("auth-user")??localStorage.getItem("auth-user");

    if(storage_user===null){ $.unblockUI(); logout(); return; }

    const user = JSON.parse(storage_user);
    const url = window.location.pathname;
    let role = "";
    const new_data_user = await getUser(user.id);
    const result_user = new_data_user.data();
    const register_product = document.getElementById("product_register");
    const register_user = document.getElementById("user_register");
    const loader_container = document.getElementById("loader-container");

    if(!new_data_user.exists()) { $.unblockUI(); logout(); alert("Usuario invalido."); return; }

    role=result_user.role;
    $.unblockUI();
    if(typeof(loader_container)!=="undefined" && loader_container!==null){
        loader_container.style.visibility="hidden";
        loader_container.style.opacity="0";
    }
    if(role!=="A" && role!=="B") {
        
        logout();
        
        alert("El Usuario no cuenta con un nivel de autorización valido");

        return;
    }

    if(role==="B"){
        if(register_product!==null) register_product.setAttribute("hidden","true");
        if(register_user!==null) register_user.setAttribute("hidden","true");
    }

    if(url==="/" || url==="/registroUsuario.html"){
        if(role==="A") window.location.replace("inicio.html");
        if(role==="B") window.location.replace("producto.html");

        return;
    }

    if(url==="/inicio.html" && role!=="A") {window.location.replace("producto.html"); return;}
    if(url==="/usuario.html" && role!=="A") {window.location.replace("producto.html"); return;}
}

login_validation();