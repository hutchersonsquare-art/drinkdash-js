document.addEventListener('DOMContentLoaded', function () {
  (function () {
    function parseMoney(text) {
      if (!text) return 0.0;
      return parseFloat(String(text).replace(/[^0-9.\-]/g, '')) || 0.0;
    }
    function formatMoney(v) { return '$' + Number(v || 0).toFixed(2); }

    // --- selectors ---
    var tipButtons   = document.querySelectorAll('.o_tip_button');   // buttons
    var customInput  = document.querySelector('input.tip-custom');   // custom amount field
    var hiddenTip    = document.querySelector('input[name="x_tip_amount"]');

    var deliveryCell = document.querySelector('.delivery-amount');
    var subtotalCell = document.querySelector('.subtotal-amount');
    var taxesCell    = document.querySelector('.taxes-amount');
    var tipCell      = document.querySelector('.tip-amount');
    var totalCell    = document.querySelector('.total-amount');

    function getValue(el) {
      if (!el) return 0.0;
      var v = el.getAttribute('data-value') || el.textContent || el.innerText;
      return parseMoney(v);
    }

    function recomputeAndRender(tipValue) {
      tipValue = Number(tipValue || 0);
      var subtotal = getValue(subtotalCell);
      var delivery = getValue(deliveryCell);
      var taxes    = getValue(taxesCell);
      var newTotal = subtotal + delivery + tipValue + taxes;

      if (tipCell)   tipCell.textContent   = formatMoney(tipValue);
      if (totalCell) totalCell.textContent = formatMoney(newTotal);
      if (hiddenTip) hiddenTip.value       = tipValue.toFixed(2);
    }

    // ----- active state helpers -----
    function clearButtonStates() {
      tipButtons.forEach(function (b) {
        b.classList.remove('active');
        if (b.hasAttribute('aria-pressed')) b.setAttribute('aria-pressed', 'false');
      });
    }
    function setActiveButton(btn) {
      clearButtonStates();
      if (btn) {
        btn.classList.add('active');
        if (btn.hasAttribute('aria-pressed')) btn.setAttribute('aria-pressed', 'true');
      }
    }

    // ----- button clicks (No Tip / 5 / 10 / 15) -----
    tipButtons.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var fixed = btn.getAttribute('data-tip');          // e.g. "0" for No Tip or a fixed $
        var pct   = btn.getAttribute('data-percent');      // e.g. "5" | "10" | "15"
        var subtotal = getValue(subtotalCell);
        var delivery = getValue(deliveryCell);

        var tipValue = 0;
        if (fixed !== null) {
          tipValue = parseFloat(fixed) || 0;
        } else if (pct !== null) {
          var pctNum = parseFloat(String(pct).replace('%','')) || 0;
          tipValue = (subtotal + delivery) * pctNum / 100;
        }
        // clear custom input when a button is chosen
        if (customInput) customInput.value = '';
        recomputeAndRender(tipValue);
        setActiveButton(btn);
      });
    });

    // ----- custom amount -----
    if (customInput) {
      customInput.addEventListener('input', function () {
        var val = parseMoney(customInput.value);
        recomputeAndRender(val);
        clearButtonStates();   // <— ensures any highlighted % button is cleared
      });
      customInput.addEventListener('blur', function () {
        var v = parseMoney(customInput.value);
        customInput.value = v ? v.toFixed(2) : '';
      });
    }

    // ----- initial render -----
    var initialTip = hiddenTip ? parseFloat(hiddenTip.value || 0) : 0;
    recomputeAndRender(initialTip);

    // Default selection = 10% (only if there isn't already a tip value)
    function selectDefaultTen() {
      if (hiddenTip && parseFloat(hiddenTip.value || 0) > 0) return; // respect existing tip
      var btn10 = document.querySelector('.o_tip_button[data-percent="10"], .o_tip_button[data-percent="10%"]');
      if (btn10) btn10.click();
      else {
        // fallback: compute 10% directly if the button is missing
        var tipValue = 0.10 * (getValue(subtotalCell) + getValue(deliveryCell));
        recomputeAndRender(tipValue);
      }
    }
    // try now, and again after a short delay in case the DOM renders late
    selectDefaultTen();
    setTimeout(selectDefaultTen, 150);
  })();
});
