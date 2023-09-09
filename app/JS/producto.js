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

    let stop_render=false;

    onGetShoppingCar((querySnapshot)=>{
        list_soppingcar.innerHTML=""
        let total_compra=0
        shoppingcar=[]

        querySnapshot.forEach(doc=>{
            const item={
                id: doc.id,
                ...doc.data()
            }

            shoppingcar.push(item);
        });

        if(stop_render) return;
        (async ()=>{
            for(const item of shoppingcar){
                const product=(await getTask(item.id_product)).data()
    
                list_soppingcar.innerHTML+=/*html*/`
                    <tr>
                        <td>
                            <button class ='btn-delete btn btn-outline-danger' data-id="${item.id}" data-quantity="${item.cantidad}" data-productid="${item.id_product}">X</button>
                        </td>
                        <td>${product.name}</td>
                        <td>${item.cantidad}</td>
                        <td>${product.precio}</td>
                        <td>${item.cantidad*product.precio}</td>
                    </tr>
                `
                total_compra+=item.cantidad*product.precio
                elements_form.total_compra.innerHTML=total_compra
            }

            const btn_delete=list_soppingcar.querySelectorAll(".btn-delete");
            
            btn_delete.forEach(item=>{
                item.addEventListener("click",({target: {dataset}})=>{
                    if(!confirm("¿Esta seguro de eliminar el producto?")) return;

                    const id=dataset.id;
                    const product_id=dataset.productid;
                    const quantity=parseFloat(dataset.quantity);

                    remove_shopping_car(id,quantity,product_id);
                });
            });
        })()
    });

    const btn_delete_all=document.getElementById("btn_delete_all");

    btn_delete_all.addEventListener("click",(e)=>{
        if(shoppingcar.length<=0){
            alert("No hay productos en la lista.");

            return;
        }

        if(!confirm("¿Está seguro de eliminar todos los productos de la lista?")) return;

        stop_render=true;
        elements_form.total_compra.innerHTML="";
        (async ()=>{
            const new_list_shopping_car=structuredClone(shoppingcar);

            
            for(const item of new_list_shopping_car) await remove_shopping_car(item.id,item.cantidad,item.id_product);
            stop_render=false;
        })();
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
    else alert("Por favor añada productos.");
});

const remove_shopping_car=async (id,quantity,product_id)=>{
    const product=(await getTask(product_id)).data();

    await updateTask(product_id,{
        stock: product.stock+quantity
    });
    await deleteShoppingCar(id);

    form_producto.reset();
    id_producto_autocompletado.value="";
    select_product={};
    elements_form.cantidad_total.innerHTML="";
    if(shoppingcar.length<=0) elements_form.total_compra.innerHTML="";
}