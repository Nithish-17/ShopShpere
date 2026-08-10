package com.shopsphere.service.notification;

import com.shopsphere.entity.Order;

public interface InvoicePdfGenerator {

    byte[] generateInvoice(Order order);

}