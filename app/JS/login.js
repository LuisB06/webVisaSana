import { getByEmail } from "./firebase.js";
import { bcrypt } from "./bcrypt.js";


window.addEventListener("DOMContentLoaded",()=>{
    const form = document.getElementById("fm");
    const email = document.getElementById("floatingInput");
    const password = document.getElementById("floatingPassword");
    const remember = document.getElementById("remember");

    form.addEventListener("submit",async (e)=>{
        e.preventDefault();
    
        try {
            const user_email = await getByEmail(email.value);
            let user = undefined;
            const error_message = "Usuario o Contraseña Incorrectos.";
            let id="";

            user_email.forEach(item => {
                if(typeof(user)==="undefined") { id=item.id; user=item.data();}
            });

            if(typeof(user)==="undefined"){alert(error_message); return;}

            const valid_password=bcrypt.compareSync(password.value,user.password);

            console.log(valid_password);

            if(!valid_password){alert(error_message); return;}

            const role=user.role;

            if(role!=="A" && role!=="B") {alert("El Usuario no cuenta con un nivel de autorización valido."); return;}

            const save_storage ={id};
            
            if(remember.checked) localStorage.setItem("auth-user",JSON.stringify(save_storage));
            else sessionStorage.setItem("auth-user",JSON.stringify(save_storage));
            if(role==="A") {window.location.replace("/inicio.html"); return;}
            if(role==="B") {window.location.replace("/producto.html"); return;}
        } catch (e) {
            alert("Ha Ocurrido un Error al Intentar Iniciar Sesión, Por favor contactese con el Administrador.");
            console.log(e);
        }
    });
});