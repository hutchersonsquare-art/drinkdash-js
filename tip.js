<script>
(function() {
    // Change this to your Driver Tip product ID
    const DRIVER_TIP_PRODUCT_ID = __export__.product_template_4651_71da17c0;  

    function updateDriverTip(amount) {
        // Remove existing Driver Tip line if present
        $(".oe_cart input[name='product_id'][value='" + DRIVER_TIP_PRODUCT_ID + "']")
            .closest("form")
            .find("a.js_delete_product")
            .trigger("click");

        // If tip is 0, stop here
        if (amount <= 0) return;

        // Add new Driver Tip line with custom price
        $.post("/shop/cart/update_json", {
            product_id: DRIVER_TIP_PRODUCT_ID,
            add_qty: 1,
            set_price: amount   // Odoo normally blocks this, but we'll override
        }).done(function() {
            window.location.reload(); // refresh totals
        });
    }

    // Hook into your tip buttons
    $(document).on("click", ".o_tip_button", function() {
        const tipPercent = parseFloat($(this).data("tip")); // e.g. 5, 10, 15
        const subtotal = parseFloat($("#order_subtotal").data("value")); // adjust selector
        const delivery = parseFloat($("#order_delivery").data("value")); // adjust selector
        const tipAmount = ((subtotal + delivery) * tipPercent / 100).toFixed(2);
        updateDriverTip(tipAmount);
    });

    // Custom tip input
    $(document).on("input", "#custom_tip_input", function() {
        const tipAmount = parseFloat($(this).val()) || 0;
        updateDriverTip(tipAmount.toFixed(2));
    });
})();
</script>
