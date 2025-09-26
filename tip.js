document.addEventListener('DOMContentLoaded', function () {
  (function () {
    // ---------- helpers ----------
    function parseMoney(text) {
      if (!text) return 0.0;
      return parseFloat(String(text).replace(/[^0-9.\-]/g, '')) || 0.0;
    }
    function formatMoney(v) { return '$' + Number(v || 0).toFixed(2); }

    // Wait until an element exists (or cond() returns a truthy value)
    function waitFor(condOrSelector, timeoutMs = 5000, interval = 50) {
      return new Promise((resolve, reject) => {
        const start = Date.now();
        const timer = setInterval(() => {
          const val = (typeof condOrSelector === 'function')
            ? condOrSelector()
            : document.querySelector(condOrSelector);
          if (val) { clearInterval(timer); resolve(val); }
          else if (Date.now() - start > timeoutMs) { clearInterval(timer); reject(new Error('waitFor timeout')); }
        }, interval);
      });
    }

    // Fire real mouse events so any framework listeners run
    function simulatedClick(el) {
      ['pointerdown', 'mousedown', 'mouseup', 'click'].forEach(type => {
        el.dispatchEvent(new MouseEvent(type, { view: window, bubbles: true, cancelable: true }));
      });
    }

    // ---------- selectors ----------
    var tipButtons    = document.querySelectorAll('.o_tip_button');   // % buttons (No Tip, 5, 10, 15)
    var customInput   = document.querySelector('input.tip-custom');   // custom tip input
    var hiddenTip     = document.querySelector('input[name="x_tip_amount"]');

    var deliveryCell  = document.querySelector('.delivery-amount');
    var subtotalCell  = document.querySelector('.subtotal-amount');
    var taxesCell     = document.querySelector('.taxes-amount');
    var tipCell       = document.querySelector('.tip-amount');
    var totalCell     = document.querySelector('.total-amount');

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

    function clearButtonStates() {
      document.querySelectorAll('.o_tip_button.active').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.o_tip_button[aria-pressed="true"]').forEach(b => b.setAttribute('aria-pressed', 'false'));
      if (customInput) customInput.classList.remove('active');
    }

    function setActiveButton(btn) {
      clearButtonStates();
      if (btn) {
        btn.classList.add('active');
        if (btn.hasAttribute('aria-pressed')) btn.setAttribute('aria-pressed', 'true');
      }
      if (customInput) customInput.value = ''; // when a % is chosen, clear custom input
    }

    // ---------- button clicks ----------
    tipButtons.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var fixed = btn.getAttribute('data-tip');      // e.g. "0" for No Tip
        var pct   = btn.getAttribute('data-percent');  // "5" | "10" | "15"
        var subtotal = getValue(subtotalCell);
        var delivery = getValue(deliveryCell);

        var tipValue = 0;
        if (fixed !== null) {
          tipValue = parseFloat(fixed) || 0;
        } else if (pct !== null) {
          var pctNum = parseFloat(String(pct).replace('%','')) || 0;
          tipValue = (subtotal + delivery) * pctNum / 100;
        }
        recomputeAndRender(tipValue);
        setActiveButton(btn);
      });
    });

    // ---------- custom tip typing ----------
    if (customInput) {
      customInput.addEventListener('input', function () {
        var val = parseMoney(customInput.value);
        // Clear % button highlights immediately
        clearButtonStates();
        if (val > 0) customInput.classList.add('active');
        recomputeAndRender(val);
      });

      customInput.addEventListener('blur', function () {
        var v = parseMoney(customInput.value);
        customInput.value = v ? v.toFixed(2) : '';
        if (!v) customInput.classList.remove('active');
      });
    }

    // ---------- DEFAULT: trigger a REAL click on 10% ----------
    // Only do this if there isn't already a tip value set (e.g. user returning)
    var initialTip = hiddenTip ? parseFloat(hiddenTip.value || 0) : 0;
    if (!initialTip) {
      // Wait until the 10% button is present, then simulate a real click
      waitFor('.o_tip_button[data-percent="10"]', 5000, 50)
        .then(function (btn10) {
          simulatedClick(btn10); // fires your existing click logic + highlights
        })
        .catch(function(){ /* ignore if not found */ });
    } else {
      // If a tip is already set (e.g., navigating back), just render it
      recomputeAndRender(initialTip);
    }
  })();
});
