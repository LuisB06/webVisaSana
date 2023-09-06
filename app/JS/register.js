import { saveUser, getByEmail } from "./firebase.js";
import { bcrypt } from "./bcrypt.js";

window.addEventListener("DOMContentLoaded",()=>{
    const data_user={
        name: document.getElementById("firstName"),
        lastname: document.getElementById("lastName"),
        email: document.getElementById("email"),
        password: document.getElementById("password"),
        address: document.getElementById("address"),
    };
    const fm = document.getElementById("fm");

    fm.addEventListener("submit",async (e)=>{
        e.preventDefault();

        if(!fm.checkValidity()) return;

        try {
            const email=data_user.email.value;
            const users_email=await getByEmail(email);
            let exists_user=false;

            users_email.forEach(item => {
                const user_email=item.data();

                if(user_email.email===email) exists_user=true;
            });

            if(exists_user){alert("El email ingresado ya existe, por favor verifique la información."); return;}

            await saveUser(
                data_user.name.value,
                data_user.lastname.value,
                email,
                bcrypt.hashSync(data_user.password.value,4),
                "B",
                data_user.address.value
            );
            alert("Registro Exitoso");
            window.location.replace("/");
        } catch (e) {
            alert("Ha ocurrido un error al intentar registrarse, por favor contactese con el administrador.")
            console.log(e);
        }
    });
});