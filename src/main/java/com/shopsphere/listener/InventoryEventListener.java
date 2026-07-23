package com.shopsphere.listener;

import com.shopsphere.event.LowStockEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class InventoryEventListener {

    @EventListener
    public void handleLowStock(
            LowStockEvent event) {

        log.warn("""

                LOW STOCK ALERT

                Product : {}

                Current Stock : {}

                Minimum Stock : {}

                """,

                event.getProductName(),

                event.getCurrentStock(),

                event.getMinimumStock()

        );

    }

}