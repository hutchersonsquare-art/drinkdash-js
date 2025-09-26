document.addEventListener("DOMContentLoaded", function () {
    const hiddenTipField = document.querySelector('input[name="x_tip_amount"]');
    const payButton = document.querySelector('button[name="o_payment_submit_button"]');

    if (payButton && hiddenTipField) {
        payButton.addEventListener("click", function () {
            const tip = parseFloat(hiddenTipField.value || "0");
            if (tip > 0) {
                fetch("/shop/cart/update_json", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    body: `csrf_token=${odoo.csrf_token}&add_tip=1&x_tip_amount=${tip}`
                });
            }
        });
    }
});
