export const logout=()=>{
    const url = window.location.pathname;

    localStorage.removeItem("auth-user");
    sessionStorage.removeItem("auth-user");
    if(url!=="/" && url!=="/registroUsuario.html") window.location.replace("/");
};