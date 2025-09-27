(function () {
    // --- Helpers ---
    function parseMoney(raw) {
        if (!raw) return 0;
        // remove everything except digits, dot, minus
        const m = String(raw).replace(/[^0-9.\-]/g, '');
        const v = parseFloat(m);
        return isNaN(v) ? 0 : v;
    }

    function findRowAmount(rowName) {
        // tries both common names across Odoo versions
        const row = document.querySelector(
            `tr[name="${rowName}"] td.text-end, tr[name="${rowName}"] td:nth-last-child(1)`
        );
        return row ? parseMoney(row.textContent) : 0;
    }

    function formatMoneyLike(el, value) {
        // Try to mimic existing currency formatting using the Total cell symbol
        const totalCell = document.querySelector('tr[name="o_order_total"] td.text-end, tr[name="o_order_total"] td:nth-last-child(1)');
        const sample = totalCell ? totalCell.textContent.trim() : '$0.00';
        const hasLeading = /^[^\d\-]+/.exec(sample);
        const hasTrailing = /[^\d.\-]+$/.exec(sample);
        const rounded = (Math.round(value * 100) / 100).toFixed(2);
        return `${hasLeading ? hasLeading[0] : '$'}${rounded}${hasTrailing ? hasTrailing[0] : ''}`;
    }

    function ensureTipRow() {
        // If Tip row not present, insert after Delivery
        let tipRow = document.querySelector('tr[name="o_order_tip"]');
        if (!tipRow) {
            const deliveryRow = document.querySelector('tr[name="o_order_delivery"]');
            if (!deliveryRow) return null;
            tipRow = document.createElement('tr');
            tipRow.setAttribute('name', 'o_order_tip');
            tipRow.innerHTML = `
                <td class="ps-0 pt-0 pb-2 border-0 text-muted" colspan="2">Tip</td>
                <td class="text-end pe-0 pt-0 pb-2 border-0">
                    <span class="tip-amount">$0.00</span>
                </td>
            `;
            deliveryRow.parentNode.insertBefore(tipRow, deliveryRow.nextSibling);
        }
        return tipRow;
    }

    function getBaseForPercent() {
        // Tip base = Subtotal + Delivery (no taxes). Adjust if you prefer Subtotal only.
        const subtotal = findRowAmount('o_order_subtotal') || findRowAmount('o_order_untaxed');
        const delivery = findRowAmount('o_order_delivery');
        return subtotal + delivery;
    }

    function getExistingTip() {
        const tipSpan = document.querySelector('tr[name="o_order_tip"] .tip-amount');
        return tipSpan ? parseMoney(tipSpan.textContent) : 0;
    }

    function setTipAmount(tip) {
        const tipRow = ensureTipRow();
        if (!tipRow) return;

        const tipSpan = tipRow.querySelector('.tip-amount');
        const formatted = formatMoneyLike(tipSpan, tip);
        tipSpan.textContent = formatted;

        const hidden = document.getElementById('x_tip_amount');
        if (hidden) hidden.value = (Math.round(tip * 100) / 100).toFixed(2);

        // Visually update Total = (Total - oldTip) + newTip
        const totalCell = document.querySelector('tr[name="o_order_total"] td.text-end, tr[name="o_order_total"] td:nth-last-child(1)');
        if (totalCell) {
            const currentTotal = parseMoney(totalCell.textContent);
            const oldTip = getExistingTip();
            const newTotal = currentTotal - oldTip + tip;
            totalCell.textContent = formatMoneyLike(totalCell, newTotal);
        }
    }

    // --- Wire buttons and input ---
    function onPercentClick(e) {
        const btn = e.target.closest('.o_tip_button');
        if (!btn) return;
        e.preventDefault();
        const pct = parseFloat(btn.getAttribute('data-tip') || '0') || 0;
        const base = getBaseForPercent();
        const tip = base * (pct / 100);
        setTipAmount(tip);
    }

    function onCustomChange(e) {
        const inp = e.target.closest('#tip-custom');
        if (!inp) return;
        const val = parseFloat(inp.value || '0') || 0;
        setTipAmount(val);
    }

    document.addEventListener('click', onPercentClick);
    document.addEventListener('input', onCustomChange);
})();
