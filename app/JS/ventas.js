import {onGetSale} from "./firebase.js"
import { open_pdf } from "./generate-pdf.js"

const build_table=(list_h_ventas_element, list_h_ventas_array)=>{
    let html="";

    list_h_ventas_array.forEach(item=>{
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
            </tr>
        `;
    });

    list_h_ventas_element.innerHTML=html;
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
        let total_sales=0;
        const date_now=new Date(Date.now());
        const date_now_string=`${date_now.getUTCFullYear()}-${date_now.getUTCMonth()+1}-${date_now.getUTCDate()}`;
        const date_filter=date.value;

        sales.forEach(item=>{
            total_sales+=parseFloat(item.total);
        });

        const document_definition={
            info:{
                title: `Reporte Ventas - ${date_now_string}`,
                author: "Vida Sana",
                subject: "Reporte PDF"
            },
            pageSize: "A4",
            pageOrientation: 'portrait',
            pageMargins: [40,60,40,60],
            header: (currentPage, pageCount)=>[
                {
                    text: currentPage.toString() + ' de ' + pageCount,
                    alignment: "right",
                    style:["m-10"]
                },
            ],
            content: [
                {
                    image: "logo",
                    width: 100,
                    height: 100,
                    style: "logo"
                },
                {
                    layout: 'lightHorizontalLines',
                    table:{
                        widths: ["auto","*"],
                        body:[
                            ["",""],
                            [{text: "Título:", style:["size","table-header"]},{text:" Reporte de Ventas Vida Sana", size:["size"]}],
                            [{text: "Fecha del Reporte:", style:["size","table-header"]},{text: date_now_string, style:["size"]}],
                            [{text: "Total de Ventas:", style:["size","table-header"]},{text: `$ ${total_sales.toFixed(2)}`, style:["size"]}],
                        ]
                    }
                },
                {
                    layout: 'lightHorizontalLines',
                    table:{
                        headerRows: 2,
                        widths: ["auto","*","auto"],
                        body:[
                            ["","",""],
                            ...(()=>{
                                const table_sales=[
                                    [{text: "Fecha", style: ["size", "table-header"]},{text: "Lista de Productos", style:["size","table-header"]}, {text: "Total", style:["size","table-header"]}]
                                ];

                                sales.forEach(item=>{
                                    table_sales.push([
                                        {text: item.fecha, style: ["size"]},
                                        {
                                            layout: 'lightHorizontalLines',
                                            table:{
                                                headerRows: 2,
                                                widths: ["*","auto","auto","auto"],
                                                body:[
                                                    ...(()=>{
                                                        const table_products=[
                                                            [{text:"Producto", style:["size", "table-header"]},{text:"Precio", style:["size", "table-header"]},{text:"Cantidad", style:["size", "table-header"]},{text:"Total", style:["size", "table-header"]}]
                                                        ];

                                                        item.products.forEach(product=>{
                                                            table_products.push([
                                                                {text: product.name, style: ["size"]},
                                                                {text: `$ ${product.precio}`, style: ["size"]},
                                                                {text: product.cantidad, style: ["size"]},
                                                                {text: `$ ${product.total}`, style: ["size"]}
                                                            ]);
                                                        });

                                                        return table_products;
                                                    })()
                                                ]
                                            }
                                        },
                                        {text: `$ ${item.total}`, style: ["size"]}
                                    ]);
                                });

                                return table_sales;
                            })()
                        ]
                    }
                }
            ],
            images:{
                "logo": "https://cdn-icons-png.flaticon.com/512/5071/5071208.png"
            },
            styles:{
                "size":{
                    fontSize: 12,
                    margin:[0,5,0,5]
                },
                "table-header":{
                    bold: true
                },
                "logo":{
                    alignment: "center",
                    margin:[0,0,0,10]
                },
                "m-10":{
                    margin:[10,10,10,10]
                }
            }
        };

        if(date_filter!=="") document_definition.content[1].table.body.push([
            {text: "Filtrado por:", style:["size","table-header"]},
            {text: date_filter, style:["size"]},
        ]);

        open_pdf(document_definition);
    });
});