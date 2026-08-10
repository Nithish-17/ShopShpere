package com.shopsphere.util;

import java.util.UUID;

public class PaymentReferenceGenerator {

    public static String generate() {

        return "PAY-"
                + UUID.randomUUID()
                .toString()
                .replace("-", "")
                .substring(0, 12)
                .toUpperCase();

    }
}
