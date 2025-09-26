document.addEventListener('DOMContentLoaded', function () {
  (function () {
    function parseMoney(text) {
      if (!text) return 0.0;
      return parseFloat(String(text).replace(/[^0-9.\-]/g, '')) || 0.0;
    }

    function formatMoney(v) {
      return '$' + Number(v || 0).toFixed(2);
    }

    // Selectors
    var tipButtons = document.querySelectorAll('.o_tip_button');        
    var customInput = document.querySelector('input.tip-custom');  
    var hiddenTipField = document.querySelector('input[name="x_tip_amount"]');

    var deliveryCell = document.querySelector('.delivery-amount'); 
    var subtotalCell = document.querySelector('.subtotal-amount'); 
    var taxesCell = document.querySelector('.taxes-amount');       
    var tipCell = document.querySelector('.tip-amount');           
    var totalCell = document.querySelector('.total-amount');       

    function getValue(el) {
      if (!el) return 0.0;
      var v = el.getAttribute('data-value') || el.textContent || el.innerText;
      return parseMoney(v);
    }

    function recomputeAndRender(tipValue) {
      tipValue = Number(tipValue || 0);

      var subtotal = getValue(subtotalCell);
      var delivery = getValue(deliveryCell);
      var taxes = getValue(taxesCell);

      var newTotal = subtotal + delivery + tipValue + taxes;

      if (tipCell) tipCell.textContent = formatMoney(tipValue);
      if (totalCell) totalCell.textContent = formatMoney(newTotal);

      if (hiddenTipField) hiddenTipField.value = tipValue.toFixed(2);
    }

    // Helper: highlight active button
    function setActiveButton(btn) {
      tipButtons.forEach(function (b) { b.classList.remove('active'); });
      if (btn) btn.classList.add('active');
    }

    // Tip button clicks
    tipButtons.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var fixed = btn.getAttribute('data-tip');
        var pct = btn.getAttribute('data-percent');

        var subtotal = getValue(subtotalCell);
        var delivery = getValue(deliveryCell);

        var tipValue = 0;
        if (fixed !== null) {
          tipValue = parseFloat(fixed) || 0;
        } else if (pct !== null) {
          var pctNum = parseFloat(pct) || 0;
          tipValue = (subtotal + delivery) * pctNum / 100;
        }
        recomputeAndRender(tipValue);
        setActiveButton(btn);  // highlight the selected button
        if (customInput) customInput.value = ''; // clear custom input if button clicked
      });
    });

    // Custom tip input
    if (customInput) {
      customInput.addEventListener('input', function () {
        var val = parseMoney(customInput.value);
        recomputeAndRender(val);
        setActiveButton(null); // clear highlights when typing custom amount
      });
      customInput.addEventListener('blur', function () {
        var v = parseMoney(customInput.value);
        customInput.value = v ? v.toFixed(2) : '';
      });
    }

    // Initial render
    var initialTip = hiddenTipField ? parseFloat(hiddenTipField.value || 0) : 0;
    recomputeAndRender(initialTip);

    // Default selection: 10%
    var defaultBtn = document.querySelector('.o_tip_button[data-percent="10"]');
    if (defaultBtn && initialTip === 0) {
      defaultBtn.click();
    }
  })();
});
