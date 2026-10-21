(() => {
  'use strict';
  const fmt = value => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 4 }).format(value);
  function number(values, key, { min = 0, strict = true, max = Infinity, integer = false } = {}) {
    const raw = values[key];
    const value = Number(raw);
    if (raw === '' || raw == null || !Number.isFinite(value) || (strict ? value <= min : value < min) || value > max || (integer && !Number.isInteger(value))) {
      throw new Error(`Check ${key.replace(/_/g, ' ')}. Enter a valid ${integer ? 'whole ' : ''}number${strict && min === 0 ? ' greater than zero' : ''}.`);
    }
    return value;
  }
  const quantity = values => number(values, 'quantity', { integer: true, max: 1000000 });
  const weight = (volume, density, count) => {
    const perPiece = volume * density / 1e6;
    return { perPiece, total: perPiece * count, lines: [`${fmt(perPiece)} kg per piece`, `${fmt(perPiece * count)} kg total · ${count} ${count === 1 ? 'piece' : 'pieces'}`] };
  };
  function calculate(kind, values) {
    const n = (key, options) => number(values, key, options);
    let result;
    if (kind === 'sheet') result = weight(n('length') * n('width') * n('thickness'), n('density'), quantity(values));
    else if (kind === 'round') result = weight(Math.PI * n('diameter') ** 2 / 4 * n('length'), n('density'), quantity(values));
    else if (kind === 'pipe') {
      const outside = n('outside_diameter'), wall = n('wall_thickness');
      const inside = outside - 2 * wall;
      if (inside <= 0) throw new Error('Wall thickness must be less than half the outside diameter.');
      result = weight(Math.PI * (outside ** 2 - inside ** 2) / 4 * n('length'), n('density'), quantity(values));
      result.insideDiameter = inside;
      result.lines.unshift(`${fmt(inside)} mm inside diameter`);
    } else if (kind === 'bend') {
      const angle = n('angle', { max: 179.999 });
      const allowance = angle * Math.PI / 180 * (n('inside_radius', { strict: false }) + n('k_factor', { strict: false, max: 1 }) * n('thickness'));
      result = { allowance, lines: [`${fmt(allowance)} mm bend allowance`, 'Confirm tooling, material and the K-factor before production.'] };
    } else if (kind === 'nest') {
      const length = n('sheet_length'), width = n('sheet_width'), partLength = n('part_length'), partWidth = n('part_width'), gap = n('gap', { strict: false });
      const grid = (l, w) => Math.floor((length + gap) / (l + gap)) * Math.floor((width + gap) / (w + gap));
      const normal = grid(partLength, partWidth), rotated = grid(partWidth, partLength), count = Math.max(normal, rotated);
      result = { count, normal, rotated, lines: [`${fmt(count)} parts per sheet`, `Uniform grids: ${fmt(normal)} normal / ${fmt(rotated)} rotated. Excludes edge margins and mixed-orientation nesting.`] };
    } else if (kind === 'print') {
      const mass = n('volume') * n('density') * n('infill', { max: 100 }) / 100 * quantity(values) * (1 + n('allowance', { strict: false, max: 100 }) / 100);
      result = { mass, lines: [`${fmt(mass)} g planning material`, 'Approximation only: shells, supports, orientation and slicer settings change actual usage. This is not a price quotation.'] };
    } else if (kind === 'convert') {
      const factors = { 'mm-in': [1 / 25.4, 0, 'in'], 'in-mm': [25.4, 0, 'mm'], 'kg-lb': [2.2046226218, 0, 'lb'], 'lb-kg': [1 / 2.2046226218, 0, 'kg'], 'bar-psi': [14.5037738, 0, 'psi'], 'psi-bar': [1 / 14.5037738, 0, 'bar'], 'c-f': [9 / 5, 32, '°F'], 'f-c': [5 / 9, -160 / 9, '°C'] };
      const factor = factors[values.conversion];
      if (!factor) throw new Error('Choose a supported conversion.');
      const temperature = ['c-f', 'f-c'].includes(values.conversion);
      const value = n('value', { min: temperature ? -Infinity : 0, strict: false });
      const converted = value * factor[0] + factor[1];
      result = { converted, lines: [`${fmt(converted)} ${factor[2]}`] };
    } else throw new Error('Choose an engineering calculator.');
    for (const value of Object.values(result)) if (typeof value === 'number' && !Number.isFinite(value)) throw new Error('These inputs exceed the supported calculation range.');
    return result;
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { calculate };
  if (typeof document === 'undefined') return;
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-calculator]').forEach(form => {
      const output = form.querySelector('[data-calculator-result]');
      const link = form.querySelector('[data-calculator-rfq]');
      const button = form.querySelector('button[type="submit"]');
      let generation = 0;
      let controller;
      form.addEventListener('input', () => {
        generation++;
        controller?.abort();
        if (link) link.hidden = true;
        output.classList.remove('error');
        output.textContent = 'Inputs changed. Calculate to update the result.';
      });
      form.addEventListener('submit', async event => {
        event.preventDefault();
        if (!form.reportValidity()) return;
        const current = ++generation;
        const values = Object.fromEntries(new FormData(form));
        const kind = form.dataset.calculator;
        button.disabled = true;
        output.classList.remove('error');
        if (link) link.hidden = true;
        try {
          let result;
          if (kind === 'currency') {
            const amount = number(values, 'amount', { strict: false });
            const allowed = ['INR', 'USD', 'EUR', 'GBP', 'JPY'];
            if (!allowed.includes(values.from) || !allowed.includes(values.to)) throw new Error('Choose a supported currency.');
            if (values.from === values.to) result = { lines: [`${fmt(amount)} ${values.to}`, 'Same currency; no external rate required.'] };
            else {
              output.textContent = 'Loading a live reference exchange rate…';
              controller = new AbortController();
              const timer = setTimeout(() => controller.abort(), 8000);
              try {
                const response = await fetch(`https://api.frankfurter.dev/v2/rate/${values.from}/${values.to}`, { signal: controller.signal, headers: { Accept: 'application/json' } });
                if (!response.ok) throw new Error('Rate unavailable');
                const data = await response.json();
                const rate = Number(data.rate);
                if (!Number.isFinite(rate) || rate <= 0) throw new Error('Invalid exchange rate');
                result = { lines: [`${fmt(amount * rate)} ${values.to}`, `1 ${values.from} = ${fmt(rate)} ${values.to} · Reference date: ${data.date || 'latest working day'}. Bank charges and actual transaction rates may differ.`] };
              } catch (_) { throw new Error('The live rate service is unavailable. Please try again. No estimated rate has been substituted.'); }
              finally { clearTimeout(timer); }
            }
          } else result = calculate(kind, values);
          if (current !== generation) return;
          output.replaceChildren();
          result.lines.forEach((text, index) => {
            const element = document.createElement(index ? 'div' : 'strong');
            element.textContent = text;
            output.appendChild(element);
          });
          if (link) {
            const query = new URLSearchParams({ requirement: 'Engineering calculation review', message: `${form.querySelector('h3').textContent}: ${result.lines.join(' ')} Inputs: ${JSON.stringify(values)}. Please review this requirement.` });
            link.href = '/request-quote.html?' + query;
            link.hidden = false;
          }
        } catch (error) {
          if (current === generation) { output.classList.add('error'); output.textContent = error.message; }
        } finally { button.disabled = false; }
      });
    });
  });
})();
