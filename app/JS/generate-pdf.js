export const open_pdf = (document_definition) => {
    pdfMake.createPdf(document_definition).open();
}

export const generate_report = (sales, date) => {
    let total_sales = 0;
    const date_now = new Date(Date.now());
    const date_now_string = `${date_now.getUTCFullYear()}-${date_now.getUTCMonth() + 1}-${date_now.getUTCDate()}`;
    const date_filter = date.value;

    sales.forEach(item => {
        total_sales += parseFloat(item.total);
    });

    const document_definition = {
        info: {
            title: `Reporte Ventas - ${date_now_string}`,
            author: "Vida Sana",
            subject: "Reporte PDF"
        },
        pageSize: "A4",
        pageOrientation: 'portrait',
        pageMargins: [40, 60, 40, 60],
        header: (currentPage, pageCount) => [
            {
                text: currentPage.toString() + ' de ' + pageCount,
                alignment: "right",
                style: ["m-10"]
            },
        ],
        content: [
            { text: "Vida Sana", style: "header" }, //TEXTO DEL TITULO
            {
                image: "logo",
                width: 100,
                height: 100,
                style: "logo"
            },
            {
                layout: 'lightHorizontalLines',
                table: {
                    widths: ["auto", "*"],
                    body: [
                        ["", ""],
                        [{ text: "Título:", style: ["size", "table-header"] }, { text: " Reporte de Ventas Vida Sana", size: ["size"] }],
                        [{ text: "Fecha del Reporte:", style: ["size", "table-header"] }, { text: date_now_string, style: ["size"] }],
                        [{ text: "Total de Ventas:", style: ["size", "table-header"] }, { text: `$ ${total_sales.toFixed(2)}`, style: ["size"] }],
                    ]
                }
            },
            {
                layout: 'lightHorizontalLines',
                table: {
                    headerRows: 2,
                    widths: ["auto", "*", "auto"],
                    body: [
                        ["", "", ""],
                        ...(() => {
                            const table_sales = [
                                [{ text: "Fecha", style: ["size", "table-header"] }, { text: "Lista de Productos", style: ["size", "table-header"] }, { text: "Total", style: ["size", "table-header"] }]
                            ];

                            sales.forEach(item => {
                                table_sales.push([
                                    { text: item.fecha, style: ["size"] },
                                    {
                                        layout: 'lightHorizontalLines',
                                        table: {
                                            headerRows: 2,
                                            widths: ["*", "auto", "auto", "auto"],
                                            body: [
                                                ...(() => {
                                                    const table_products = [
                                                        [{ text: "Producto", style: ["size", "table-header"] }, { text: "Precio", style: ["size", "table-header"] }, { text: "Cantidad", style: ["size", "table-header"] }, { text: "Total", style: ["size", "table-header"] }]
                                                    ];

                                                    item.products.forEach(product => {
                                                        table_products.push([
                                                            { text: product.name, style: ["size"] },
                                                            { text: `$ ${product.precio}`, style: ["size"] },
                                                            { text: product.cantidad, style: ["size"] },
                                                            { text: `$ ${product.total}`, style: ["size"] }
                                                        ]);
                                                    });

                                                    return table_products;
                                                })()
                                            ]
                                        }
                                    },
                                    { text: `$ ${item.total}`, style: ["size"] }
                                ]);
                            });

                            return table_sales;
                        })()
                    ]
                }
            }
        ],
        images: {
            "logo": "http://127.0.0.1:5500/img/128px_logo.png"
        },
        styles: {
            "size": {
                fontSize: 12,
                margin: [0, 5, 0, 5]
            },
            "table-header": {
                bold: true
            },
            "logo": {
                alignment: "center",
                margin: [0, 0, 0, 10]
            },
            "m-10": {
                margin: [10, 10, 10, 10]
            },
            "header": {
                fontSize: "30",
                alignment: "center",
                bold: true,
                italics: true
            }
        }
    };


    //TODO: Si se elimina el texto, cambiar el valor 2 -> 1
    if (date_filter !== "") document_definition.content[2].table.body.push([ 
        { text: "Filtrado por:", style: ["size", "table-header"] },
        { text: date_filter, style: ["size"] },
    ]);


    open_pdf(document_definition);
}