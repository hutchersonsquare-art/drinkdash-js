<script>
document.addEventListener('DOMContentLoaded', function () {
  // ---------- helpers ----------
  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));

  const fmt = v => '$' + Number(v || 0).toFixed(2);
  const parseMoney = t => parseFloat(String(t || '').replace(/[^0-9.\-]/g, '')) || 0;

  function cellVal(sel) {
    const el = $(sel);
    if (!el) return 0;
    const v = el.getAttribute('data-value') || el.textContent || el.innerText;
    return parseMoney(v);
  }

  function setActive(btn) {
    $$('.o_tip_button').forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-pressed', 'false');
    });
    if (btn) {
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
    }
    // clear the custom box when a % choice is made
    const ci = $('.tip-custom');
    if (ci) { ci.value = ''; ci.classList.remove('active'); }
  }

  function recompute(tipAmount) {
    tipAmount = Number(tipAmount || 0);
    const subtotal = cellVal('.subtotal-amount');
    const delivery = cellVal('.delivery-amount');
    const taxes    = cellVal('.taxes-amount');
    const total    = subtotal + delivery + taxes + tipAmount;

    const tipCell   = $('.tip-amount');
    const totalCell = $('.total-amount');
    const hiddenTip = $('input[name="x_tip_amount"]');

    if (tipCell)   tipCell.textContent   = fmt(tipAmount);
    if (totalCell) totalCell.textContent = fmt(total);
    if (hiddenTip) hiddenTip.value       = tipAmount.toFixed(2);
  }

  function baseForPercent() {
    // Percent on (Subtotal + Delivery) as we discussed
    return cellVal('.subtotal-amount') + cellVal('.delivery-amount');
  }

  // ---------- wire % buttons ----------
  $$('.o_tip_button').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const fixed   = btn.getAttribute('data-tip');      // e.g. "0" for No Tip
      const percent = btn.getAttribute('data-percent');  // "5" | "10" | "15"
      let tip = 0;

      if (fixed !== null) {
        tip = parseFloat(fixed) || 0;
      } else if (percent !== null) {
        const pct = parseFloat(percent) || 0;
        tip = baseForPercent() * pct / 100;  // ✅ correct % calc
      }

      recompute(tip);
      setActive(btn);
    });
  });

  // ---------- wire custom amount ----------
  const custom = $('.tip-custom');
  if (custom) {
    custom.addEventListener('input', () => {
      // de-highlight % buttons when typing custom
      $$('.o_tip_button').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed','false'); });
      const v = parseMoney(custom.value);
      if (v > 0) custom.classList.add('active'); else custom.classList.remove('active');
      recompute(v);
    });
    custom.addEventListener('blur', () => {
      const v = parseMoney(custom.value);
      custom.value = v ? v.toFixed(2) : '';
    });
  }

  // ---------- default to 10% unless a tip is already set ----------
  (function selectDefaultTen() {
    const hiddenTip = $('input[name="x_tip_amount"]');
    const already = hiddenTip ? parseFloat(hiddenTip.value || '0') : 0;
    if (already > 0) { recompute(already); return; }

    // wait a tick in case Odoo re-renders that panel
    setTimeout(() => {
      const tenBtn = document.querySelector('.o_tip_button[data-percent="10"]');
      if (tenBtn) { tenBtn.click(); } else { // fallback: just compute it
        recompute(baseForPercent() * 0.10);
      }
    }, 50);
  })();
});
</script>
