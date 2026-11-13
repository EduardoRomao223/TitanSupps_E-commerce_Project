(() => {
  const readTotal = () => {
    try {
      let saved = localStorage.getItem('titansupps_carrinho');
      if (saved === null) {
        const legacy = JSON.parse(localStorage.getItem('carrinho') || '[]');
        const converted = Array.isArray(legacy) ? legacy
          .filter(item => item && typeof item.id === 'string' && Number(item.quantity ?? item.quantidade) > 0)
          .map(item => ({ id: item.id, quantity: Math.floor(Number(item.quantity ?? item.quantidade)) })) : [];
        if (converted.length) {
          localStorage.setItem('titansupps_carrinho', JSON.stringify(converted));
          localStorage.removeItem('carrinho');
        }
        saved = JSON.stringify(converted);
      }
      const items = JSON.parse(saved);
      return Array.isArray(items) ? items.reduce((total, item) => total + Math.max(0, Number(item?.quantity) || 0), 0) : 0;
    } catch {
      return 0;
    }
  };

  const updateHeader = () => {
    const count = document.getElementById('cart-count');
    const accountLabel = document.getElementById('account-label');
    if (count) count.textContent = readTotal();
    if (!accountLabel) return;
    try {
      const account = JSON.parse(localStorage.getItem('usuario_logado') || 'null');
      const firstName = String(account?.nome || '').trim().split(/\s+/)[0];
      accountLabel.textContent = firstName ? 'Olá, ' + firstName : 'Entrar';
    } catch {
      accountLabel.textContent = 'Entrar';
    }
  };

  updateHeader();
  window.addEventListener('storage', updateHeader);
})();
