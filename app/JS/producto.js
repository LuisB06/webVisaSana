import {
    onGetTasks,
    onGetShoppingCar,
    getTask,
    saveShoppingCar,
    updateTask,
    saveSale,
    deleteShoppingCar
} from "./firebase.js"


const id_producto_autocompletado=document.getElementById("id_producto_autocompletado")
let productos=[]
const form_producto=document.getElementById("form_producto")
const elements_form={
    precio: document.getElementById("precio"),
    cantidad: document.getElementById("cantidad"),
    cantidad_total: document.getElementById("cantidad_total"),
    total: document.getElementById("total"),
    total_compra: document.getElementById("total_compra")
}
let select_product={}
const list_soppingcar=document.getElementById("list_shoppingcar")
const btn_comprar=document.getElementById("btn_comprar")
let shoppingcar=[]

window.addEventListener("DOMContentLoaded",async ()=>{
    onGetTasks((querySnapshot)=>{
        while(productos.length>0) productos.pop()
        querySnapshot.forEach(doc=>{
            const producto=doc.data()
            productos.push({
                value: producto.name,
                objeto: {
                    id: doc.id,
                    ...producto
                }
            });
        })
    })

    $(id_producto_autocompletado).autocomplete({
        minLength: 0,
        delay: 0,
        source: productos,
        select(event,element){
            select_product={
                ...element.item.objeto
            }
            elements_form.precio.value=select_product.precio
            elements_form.cantidad_total.innerHTML=`/${select_product.stock}`
        }
    });

    onGetShoppingCar((querySnapshot)=>{
        list_soppingcar.innerHTML=""
        let total_compra=0
        shoppingcar=[]

        querySnapshot.forEach(async doc=>{
            const item={
                id: doc.id,
                ...doc.data()
            }
            const product=(await getTask(item.id_product)).data()

            shoppingcar.push(item)
            list_soppingcar.innerHTML+=`
                <tr>
                    <td>${product.name}</td>
                    <td>${item.cantidad}</td>
                    <td>${product.precio}</td>
                    <td>${item.cantidad*product.precio}</td>
                </tr>
            `
            total_compra+=item.cantidad*product.precio
            elements_form.total_compra.innerHTML=total_compra
        });
    });
});

form_producto.addEventListener("submit",(e)=>{
    e.preventDefault();
    if(typeof(select_product.id)!=="undefined"){
        if(parseFloat(elements_form.cantidad.value)<=select_product.stock){
            saveShoppingCar(
                parseFloat(elements_form.cantidad.value),
                select_product.id
            )
            updateTask(select_product.id,{
                name: select_product.name,
                stock: select_product.stock-parseFloat(elements_form.cantidad.value),
                precio: select_product.precio
            });
            form_producto.reset()
            id_producto_autocompletado.value=""
            select_product={}
            elements_form.cantidad_total.innerHTML=""
        }
        else alert("La cantidad establecida no puede ser mayor a la existente.")
    }
    else alert("Por favor seleccione el producto.")
});

elements_form.cantidad.addEventListener("keyup",(e)=>{
    if(elements_form.precio.value!=="") elements_form.total.value=parseFloat(elements_form.cantidad.value)*parseFloat(elements_form.precio.value)
});

btn_comprar.addEventListener("click",async (e)=>{
    if(shoppingcar.length>0){
        const products_sale=[]
        let total=0
        const date_now=new Date()

        for(let i=0; i<shoppingcar.length; i++){
            const item=shoppingcar[i]
            const product=(await getTask(item.id_product)).data()
            products_sale.push({
                name: product.name,
                precio: product.precio,
                cantidad: item.cantidad,
                total: (item.cantidad*product.precio)
            });
            total+=item.cantidad*product.precio
        }
        saveSale(
            products_sale,
            `${date_now.getFullYear()}-${date_now.getMonth()+1}-${date_now.getDate()}`,
            total
        );
        shoppingcar.forEach(async item=>{
            await deleteShoppingCar(item.id);
            list_soppingcar.innerHTML=""
            elements_form.total_compra.innerHTML=""
        });
        alert("EXITO AL REALIZAR LA COMPRA");
    }
    else alert("Por favor añada productos.")
});