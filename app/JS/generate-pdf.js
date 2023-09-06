export const open_pdf=(document_definition)=>{
    pdfMake.createPdf(document_definition).open();
}