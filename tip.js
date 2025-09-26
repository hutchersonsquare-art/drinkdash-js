document.addEventListener('DOMContentLoaded', function () {
  (function () {
    function parseMoney(text) {
      if (!text) return 0.0;
      return parseFloat(String(text).replace(/[^0-9.\-]/g, '')) || 0.0;
    }
    function formatMoney(v) { return '$' + Number(v || 0).toFixed(2); }

    var tipButtons   = document.querySelectorAll('.o_tip_button');
    var customInput  = document.querySelector('input.tip-custom');
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

    // ----- button clicks -----
    tipButtons.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var fixed = btn.getAttribute('data-tip');
        var pct   = btn.getAttribute('data-percent');
        var subtotal = getValue(subtotalCell);
        var delivery = getValue(deliveryCell);

        var tipValue = 0;
        if (fixed !== null) {
          tipValue = parseFloat(fixed) || 0;
        } else if (pct !== null) {
          var pctNum = parseFloat(String(pct).replace('%','')) || 0;
          tipValue = (subtotal + delivery) * pctNum / 100;
        }
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
        clearButtonStates(); // clears % buttons
      });
      customInput.addEventListener('blur', function () {
        var v = parseMoney(customInput.value);
        customInput.value = v ? v.toFixed(2) : '';
      });
    }

    // ----- default selection = 10% -----
    function selectDefaultTen() {
      if (hiddenTip && parseFloat(hiddenTip.value || 0) > 0) return;
      var btn10 = document.querySelector('.o_tip_button[data-percent="10"]');
      if (btn10) {
        btn10.click(); // simulate click so it highlights + computes
      }
    }
    // run immediately + after slight delay (in case DOM lags)
    selectDefaultTen();
    setTimeout(selectDefaultTen, 150);
  })();
});
