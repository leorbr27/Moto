(() => {
  'use strict';
  const API = 'https://br-noisy-resonance-b594p7s8-motoapi.compute.c-7.us-east-2.aws.neon.tech';
  const nav = document.querySelector('header .nav');
  if (!nav) return;

  const style = document.createElement('style');
  style.textContent = `
    .overdue-warning{margin-top:12px;padding:12px 14px;border:1px solid #f3c879;border-radius:12px;background:#fff0d6;color:#754000;font-size:13px;line-height:1.5}
    .overdue-warning h2{display:flex;align-items:center;gap:8px;margin:0 0 8px;color:#8a4b00;font-size:15px}
    .overdue-warning ul{margin:0;padding-left:20px}
    .overdue-warning li+li{margin-top:5px}
    .overdue-warning strong{font-weight:800}
  `;
  document.head.appendChild(style);

  const warning = document.createElement('section');
  warning.className = 'overdue-warning';
  warning.setAttribute('role', 'alert');
  warning.hidden = true;
  nav.insertAdjacentElement('afterend', warning);

  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  })[char]);
  const firstNumber = (...values) => {
    for (const value of values) {
      if (value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value))) return Number(value);
    }
    return null;
  };
  async function get(path) {
    const response = await fetch(API + path, { headers: { Accept: 'application/json' } });
    const text = await response.text();
    let data;
    try { data = text ? JSON.parse(text) : null; } catch { data = null; }
    if (!response.ok) throw new Error('HTTP ' + response.status);
    if (Array.isArray(data)) return data;
    return data?.data || data?.abastecimentos || data?.manutencoes || data?.despesas || [];
  }
  function renderDue(fuel, maintenance, expenses) {
    const observedKm = [];
    fuel.forEach(record => {
      const km = firstNumber(record.quilometragem, record.km, record.km_atual);
      if (km !== null && km >= 0) observedKm.push(km);
    });
    maintenance.forEach(record => {
      const km = firstNumber(record.quilometragem, record.km, record.km_atual);
      if (km !== null && km >= 0) observedKm.push(km);
    });
    expenses.forEach(record => {
      const km = firstNumber(record.quilometragem, record.km, record.km_atual);
      if (km !== null && km >= 0) observedKm.push(km);
    });
    if (!observedKm.length) return;
    const currentKm = Math.max(...observedKm);
    const due = maintenance.map(record => {
      const nextKm = firstNumber(record.proxima_troca_km, record.next_km, record.km_proxima_troca, record.quilometragem_vencimento);
      if (nextKm === null || nextKm <= 0 || nextKm > currentKm) return null;
      const name = record.peca_servico ?? record.item ?? record.servico ?? record.peca ?? record.descricao ?? 'Manutenção';
      return { name, nextKm, overdueKm: currentKm - nextKm };
    }).filter(Boolean).sort((a, b) => b.overdueKm - a.overdueKm);
    if (!due.length) return;
    warning.innerHTML = '<h2><span aria-hidden="true">⚠️</span> Quilometragem vencida</h2><ul>' +
      due.map(item => '<li><strong>' + escapeHtml(item.name) + '</strong> — vencida há ' +
        escapeHtml(item.overdueKm.toLocaleString('pt-BR')) + ' km (prevista para ' +
        escapeHtml(item.nextKm.toLocaleString('pt-BR')) + ' km)</li>').join('') +
      '</ul>';
    warning.hidden = false;
  }
  Promise.all([get('/abastecimentos'), get('/manutencoes'), get('/despesas')])
    .then(([fuel, maintenance, expenses]) => renderDue(fuel, maintenance, expenses))
    .catch(() => { warning.hidden = true; });
})();