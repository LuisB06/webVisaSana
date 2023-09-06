import { logout } from "./fn-logout.js";

window.addEventListener("DOMContentLoaded",()=>{
    const sing_out = document.getElementById("sing_out");

    sing_out.addEventListener("click",(e)=>{
        e.preventDefault();

        if(confirm("¿Esta seguro de Cerrar Sesión?")) logout();
    });
});

