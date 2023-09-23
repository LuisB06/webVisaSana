import {onGetSale, getSale} from "./firebase.js"
import { generate_report } from "./generate-pdf.js"

const build_table=(list_h_ventas_element, list_h_ventas_array)=>{
    let html="";

    list_h_ventas_array.forEach((item,index)=>{
        html+=/*html*/`
            <tr>
                <td>${item.fecha}</td>
                <td>
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Precio</th>
                                <th>Cantidad</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${(()=>{
                                let html_products="";

                                item.products.forEach(product=>{
                                    html_products+=/*html*/`
                                        <tr>
                                            <td>${product.name}</td>
                                            <td>${product.precio}</td>
                                            <td>${product.cantidad}</td>
                                            <td>${product.total}</td>
                                        </tr>
                                    `;
                                });

                                return html_products;
                            })()}
                        </tbody>
                    </table>
                </td>
                <td>${item.total}</td>
                <td>
                    <button class ='btn-pdf btn btn-outline-success' data-id="${index}" >PDF</button>
                </td>
            </tr>
        `;
    });

    list_h_ventas_element.innerHTML=html;

    const btn_pdf=list_h_ventas_element.querySelectorAll(".btn-pdf");

    btn_pdf.forEach(item=>{
        item.addEventListener("click",({target:{dataset}})=>{
            (async ()=>{
                const id=Number(dataset.id);
                const date=document.createElement("input");

                date.value="";
                if(list_h_ventas_array.lenght<id+1) return;

                generate_report([list_h_ventas_array[id]],date);
            })()
        });
    })
}

const filter_by_date=(list_h_ventas_array,input_date_element)=>{
    const date=input_date_element.value;
    let array_filter=[];

    if(date==="") array_filter=list_h_ventas_array;
    else array_filter=list_h_ventas_array.filter(item=>{
        const consult_date=new Date(date);
        const sale_date=new Date(item.fecha);
        const consult_date_string=`${consult_date.getUTCFullYear()}-${consult_date.getUTCMonth()+1}-${consult_date.getUTCDate()}`;
        const sale_date_string=`${sale_date.getUTCFullYear()}-${sale_date.getUTCMonth()+1}-${sale_date.getUTCDate()}`;

        return consult_date_string===sale_date_string;
    });

    return array_filter;
}

window.addEventListener("DOMContentLoaded",async(e)=>{
    const list_h_ventas_element=document.getElementById("list_h_ventas");
    let list_h_ventas_array=[];
    const date=document.getElementById("date");
    const btn_pdf=document.getElementById("btn-pdf");
    
    onGetSale(querySnapshot=>{
        list_h_ventas_array=[];

        querySnapshot.forEach(doc=>{
            const venta=doc.data();
            list_h_ventas_array.push(venta);           
        });

        build_table(list_h_ventas_element,filter_by_date(list_h_ventas_array,date));
    });

    date.addEventListener("change",()=>{
        build_table(list_h_ventas_element,filter_by_date(list_h_ventas_array,date));
    });

    btn_pdf.addEventListener("click",()=>{
        const sales=filter_by_date(list_h_ventas_array,date);
        
        generate_report(sales,date);
    });
});