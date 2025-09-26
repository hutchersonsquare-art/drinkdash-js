document.addEventListener('DOMContentLoaded', function () {
  (function () {
    function parseMoney(text) {
      if (!text) return 0.0;
      return parseFloat(String(text).replace(/[^0-9.\-]/g, '')) || 0.0;
    }

    function formatMoney(v) {
      return '$' + Number(v || 0).toFixed(2);
    }

    var tipButtons = document.querySelectorAll('.o_tip_button'); // % buttons
    var customInput = document.querySelector('input.tip-custom'); // custom input
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

    function clearButtonStates() {
      tipButtons.forEach(function (b) {
        b.classList.remove('active');
      });
      if (customInput) customInput.classList.remove('active');
    }

    function setActiveButton(btn) {
      clearButtonStates();
      if (btn) btn.classList.add('active');
      if (customInput) customInput.value = ''; // clear custom field
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
        setActiveButton(btn);
      });
    });

    // Custom tip input
    if (customInput) {
      customInput.addEventListener('input', function () {
        var val = parseMoney(customInput.value);
        recomputeAndRender(val);

        clearButtonStates();
        if (val > 0) {
          customInput.classList.add('active');
        }
      });

      customInput.addEventListener('blur', function () {
        var v = parseMoney(customInput.value);
        customInput.value = v ? v.toFixed(2) : '';
        if (!v) customInput.classList.remove('active');
      });
    }

    // ---- Default 10% ----
    var initialTip = hiddenTipField ? parseFloat(hiddenTipField.value || 0) : 0;
    if (!initialTip) {
      var defaultBtn = document.querySelector('.o_tip_button[data-percent="10"]');
      if (defaultBtn) {
        var subtotal = getValue(subtotalCell);
        var delivery = getValue(deliveryCell);
        var tipValue = (subtotal + delivery) * 0.10;
        recomputeAndRender(tipValue);
        setActiveButton(defaultBtn);
      }
    } else {
      recomputeAndRender(initialTip);
    }
  })();
});
