(function () {
  // Get CSRF token from any hidden input on the page
  function getCsrf() {
    var el = document.querySelector('input[name="csrf_token"]');
    return el ? el.value : '';
  }

  // POST to Odoo cart (no popup)
  function cartUpdate(params) {
    params.csrf_token = getCsrf();
    var body = new URLSearchParams();
    Object.keys(params).forEach(function (k) { body.append(k, params[k]); });
    return fetch('/shop/cart/update_json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
      body: body.toString(),
      credentials: 'same-origin'
    }).then(function (r) { return r.json(); });
  }

  // Refresh the right-hand order summary only
  function refreshSidebar() {
    return fetch('/shop/cart', { credentials: 'same-origin' })
      .then(function (r) { return r.text(); })
      .then(function (html) {
        var tmp = document.createElement('div');
        tmp.innerHTML = html;
        var newBox = tmp.querySelector('.o_wsale_my_cart');
        var curBox = document.querySelector('.o_wsale_my_cart');
        if (newBox && curBox) curBox.innerHTML = newBox.innerHTML;
      });
  }

  // Handle clicks on your tip buttons (those with .s_add_to_cart_btn)
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.tip-selector .s_add_to_cart_btn');
    if (!btn) return;

    e.preventDefault();                 // stop default popup add-to-cart
    e.stopImmediatePropagation();

    var productVariantId = btn.getAttribute('data-product-variant-id'); // use variant id
    if (!productVariantId) return;

    // Add 1 qty of the selected tip, then refresh the sidebar totals
    cartUpdate({ product_id: productVariantId, add_qty: 1 })
      .then(refreshSidebar)
      .catch(function(){ /* swallow errors to avoid blocking checkout UI */ });
  });

  // Optional: handle "No Tip" button to just refresh sidebar (or clear tips if you want)
  document.addEventListener('click', function (e) {
    var none = e.target.closest('.tip-selector .o_tip_none');
    if (!none) return;
    // If you keep "No Tip" as a non-product, just refresh to keep UI consistent
    setTimeout(refreshSidebar, 50);
  });
})();
