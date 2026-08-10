package com.shopsphere.service.notification;

import com.shopsphere.entity.Order;
import com.shopsphere.entity.OrderItem;
import org.openpdf.text.*;
import org.openpdf.text.pdf.PdfPTable;
import org.openpdf.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;

@Service
public class InvoicePdfGeneratorImpl implements InvoicePdfGenerator {


    @Override
    public byte[] generateInvoice(Order order) {

        ByteArrayOutputStream outputStream =
                new ByteArrayOutputStream();

        Document document =
                new Document(PageSize.A4);

        PdfWriter.getInstance(
                document,
                outputStream
        );

        document.open();

        Font titleFont =
                FontFactory.getFont(
                        FontFactory.HELVETICA_BOLD,
                        20
                );

        Paragraph title =
                new Paragraph(
                        "SHOPSPHERE INVOICE",
                        titleFont
                );

        title.setAlignment(Element.ALIGN_CENTER);

        document.add(title);

        document.add(new Paragraph(" "));

        document.add(
                new Paragraph(
                        "Order Number : "
                                + order.getId()
                )
        );

        document.add(
                new Paragraph(
                        "Order Date : "
                                + order.getOrderDate()
                )
        );

        document.add(
                new Paragraph(
                        "Customer : "
                                + order.getUser().getFirstName()
                                + " "
                                + order.getUser().getLastName()
                )
        );

        document.add(new Paragraph(" "));

        PdfPTable table =
                new PdfPTable(4);

        table.setWidthPercentage(100);

        table.addCell("Product");

        table.addCell("Price");

        table.addCell("Quantity");

        table.addCell("Subtotal");

        for(OrderItem item : order.getOrderItems()){

            table.addCell(item.getProductName());

            table.addCell(
                    item.getProductPrice().toString()
            );

            table.addCell(
                    item.getQuantity().toString()
            );

            table.addCell(
                    item.getSubtotal().toString()
            );

        }

        document.add(table);

        document.add(new Paragraph(" "));

        document.add(

                new Paragraph(

                        "Total Amount : "

                                + order.getTotalAmount()

                )

        );

        document.add(new Paragraph(" "));

        document.add(

                new Paragraph(

                        "Thank you for shopping with ShopSphere."

                )

        );

        document.close();

        return outputStream.toByteArray();

    }
}
