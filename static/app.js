// ============================================================
//  SalesPOS - Asosiy ilova (layout + sahifalar)
// ============================================================

const MENU = [
  { key: 'dashboard', label: 'Boshqaruv', icon: '📊' },
  { key: 'orders',    label: 'Buyurtmalar', icon: '🧾' },
  { key: 'tables',    label: 'Stollar', icon: '🪑' },
  { key: 'kitchen',   label: 'Oshxona', icon: '👨‍🍳' },
  { key: 'menu',      label: 'Menyu', icon: '🍽️' },
  { key: 'reports',   label: 'Hisobotlar', icon: '📈' },
];

function renderApp() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="flex h-screen overflow-hidden">
      <!-- Sidebar -->
      <aside class="w-60 bg-slate-900 text-white flex flex-col shrink-0">
        <div class="p-5 border-b border-slate-700 flex items-center gap-3">
          <div class="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center text-xl">🍽️</div>
          <div>
            <div class="font-bold leading-tight">SalesPOS</div>
            <div class="text-xs text-slate-400">Kafe tizimi</div>
          </div>
        </div>
        <nav class="flex-1 py-3 overflow-y-auto" id="navMenu"></nav>
        <div class="p-4 border-t border-slate-700">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-8 h-8 bg-brand-500 rounded-full flex items-center justify-center text-sm font-bold">
              ${(USER.full_name||'A')[0].toUpperCase()}</div>
            <div class="text-sm">${USER.full_name}</div>
          </div>
          <button onclick="logout()" class="text-slate-400 hover:text-red-400 text-sm flex items-center gap-1">
            ⏻ Chiqish</button>
        </div>
      </aside>
      <!-- Main -->
      <main class="flex-1 flex flex-col overflow-hidden">
        <header class="bg-white border-b px-6 py-4 flex items-center justify-between shrink-0">
          <h2 id="pageTitle" class="text-xl font-bold text-slate-800"></h2>
          <div class="text-sm text-slate-500">${new Date().toLocaleDateString('uz-UZ',{weekday:'long',day:'numeric',month:'long'})}</div>
        </header>
        <div id="pageContent" class="flex-1 overflow-y-auto p-6"></div>
      </main>
    </div>`;

  document.getElementById('navMenu').innerHTML = MENU.map(m => `
    <button onclick="go('${m.key}')" data-nav="${m.key}"
      class="w-full flex items-center gap-3 px-5 py-3 text-sm transition ${STATE.page===m.key?'bg-brand-500 text-white font-medium':'text-slate-300 hover:bg-slate-800'}">
      <span>${m.icon}</span> ${m.label}
    </button>`).join('');

  go(STATE.page);
}

function go(page) {
  STATE.page = page;
  document.querySelectorAll('[data-nav]').forEach(b => {
    const active = b.dataset.nav === page;
    b.className = `w-full flex items-center gap-3 px-5 py-3 text-sm transition ${active?'bg-brand-500 text-white font-medium':'text-slate-300 hover:bg-slate-800'}`;
  });
  const titles = {dashboard:'Boshqaruv paneli',orders:'Buyurtmalar',tables:'Stollar',kitchen:'Oshxona',menu:'Menyu boshqaruvi',reports:'Hisobotlar'};
  document.getElementById('pageTitle').textContent = titles[page] || '';
  const c = document.getElementById('pageContent');
  c.innerHTML = '<div class="text-center py-20 text-slate-400">Yuklanmoqda...</div>';
  ({dashboard:pageDashboard,orders:pageOrders,tables:pageTables,kitchen:pageKitchen,menu:pageMenu,reports:pageReports}[page])(c);
}

// ---- modal helper ----
function modal(title, bodyHtml, opts={}) {
  const wrap = document.createElement('div');
  wrap.className = 'fixed inset-0 z-40 flex items-center justify-center p-4';
  wrap.innerHTML = `
    <div class="absolute inset-0 bg-black/50"></div>
    <div class="relative bg-white rounded-2xl shadow-xl w-full ${opts.size||'max-w-lg'} max-h-[90vh] overflow-hidden flex flex-col">
      <div class="flex items-center justify-between p-5 border-b shrink-0">
        <h3 class="text-lg font-bold">${title}</h3>
        <button class="text-slate-400 hover:text-slate-700 text-2xl leading-none" data-close>&times;</button>
      </div>
      <div class="p-5 overflow-y-auto">${bodyHtml}</div>
    </div>`;
  wrap.querySelector('[data-close]').onclick = () => wrap.remove();
  wrap.querySelector('.bg-black\\/50').onclick = () => wrap.remove();
  document.body.appendChild(wrap);
  return wrap;
}

// ============================================================
//  DASHBOARD
// ============================================================
async function pageDashboard(c) {
  const d = await api('/dashboard/');
  c.innerHTML = `
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      ${statCard('🧾','Bugungi buyurtmalar', d.today_orders, 'bg-blue-500')}
      ${statCard('💰','Bugungi tushum', money(d.today_revenue), 'bg-brand-500')}
      ${statCard('🔥','Faol buyurtmalar', d.active_orders, 'bg-orange-500')}
      ${statCard('🪑',"Bo'sh stollar", d.tables_free+' / '+d.tables_total, 'bg-green-500')}
    </div>
    <div class="bg-white rounded-2xl border p-6 text-center text-slate-500">
      <div class="text-5xl mb-3">🍽️</div>
      <p class="font-medium text-slate-700">SalesPOS — Kafe boshqaruv tizimi</p>
      <p class="text-sm mt-1">Buyurtmalar, stollar, menyu va kassa — barchasi bitta joyda.</p>
    </div>`;
}
function statCard(icon, label, val, bg) {
  return `<div class="bg-white rounded-2xl border p-5 flex items-center gap-4">
    <div class="w-12 h-12 ${bg} rounded-xl flex items-center justify-center text-2xl">${icon}</div>
    <div><div class="text-sm text-slate-500">${label}</div>
    <div class="text-2xl font-bold text-slate-800">${val}</div></div></div>`;
}

// ============================================================
//  HISOBOTLAR (oddiy)
// ============================================================
async function pageReports(c) {
  const d = await api('/dashboard/');
  c.innerHTML = `
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      ${statCard('💰','Bugungi tushum', money(d.today_revenue), 'bg-brand-500')}
      ${statCard('🧾','Bugungi buyurtmalar', d.today_orders, 'bg-blue-500')}
      ${statCard('🔥','Faol buyurtmalar', d.active_orders, 'bg-orange-500')}
    </div>`;
}



// ============================================================
//  MENYU (taomlar + kategoriyalar + printerlar)
// ============================================================
async function pageMenu(c) {
  const tab = STATE.data.menuTab || 'items';
  c.innerHTML = `
    <div class="flex items-center justify-between mb-4 flex-wrap gap-3">
      <div class="flex gap-2">
        ${['items','categories','printers'].map(t=>`
          <button onclick="STATE.data.menuTab='${t}';go('menu')"
            class="px-4 py-2 rounded-lg text-sm font-medium ${tab===t?'bg-brand-500 text-white':'bg-white border text-slate-600 hover:bg-slate-50'}">
            ${{items:'🍽️ Taomlar',categories:'📂 Kategoriyalar',printers:'🖨️ Printerlar'}[t]}</button>`).join('')}
      </div>
      <button onclick="${tab==='items'?'itemForm()':tab==='categories'?'catForm()':'printerForm()'}"
        class="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium">+ Yangi</button>
    </div>
    <div id="menuBody"></div>`;
  if (tab==='items') await renderItems();
  else if (tab==='categories') await renderCats();
  else await renderPrinters();
}

async function renderItems() {
  const [items, cats] = await Promise.all([api('/menu/'), api('/categories/')]);
  STATE.data.cats = cats;
  const body = document.getElementById('menuBody');
  if (!items.length) { body.innerHTML = empty('🍽️','Taomlar yo\'q'); return; }
  body.innerHTML = `
    <div class="bg-white rounded-2xl border overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-slate-50 border-b text-slate-500">
          <tr><th class="text-left px-4 py-3">Nomi</th><th class="text-left px-4 py-3">Kategoriya</th>
          <th class="text-left px-4 py-3">Narx</th><th class="text-left px-4 py-3">Tannarx</th>
          <th class="text-left px-4 py-3">Foyda</th><th class="text-left px-4 py-3">Printer</th>
          <th class="text-left px-4 py-3">Holat</th><th class="text-left px-4 py-3"></th></tr>
        </thead><tbody>
        ${items.map(m=>`<tr class="border-b hover:bg-orange-50">
          <td class="px-4 py-3 font-medium">${m.name}</td>
          <td class="px-4 py-3"><span class="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs">${m.category_name||'—'}</span></td>
          <td class="px-4 py-3 font-bold text-brand-600">${money(m.price)}</td>
          <td class="px-4 py-3 text-slate-500">${money(m.cost_price)}</td>
          <td class="px-4 py-3 text-green-600 font-medium">${money(m.profit)}</td>
          <td class="px-4 py-3 text-xs">${m.printer_name?'<span class="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">🖨️ '+m.printer_name+'</span>':'—'}</td>
          <td class="px-4 py-3"><span class="px-2 py-0.5 rounded-full text-xs ${m.is_available?'bg-green-100 text-green-700':'bg-red-100 text-red-600'}">${m.is_available?'Mavjud':'Yo\'q'}</span></td>
          <td class="px-4 py-3"><div class="flex gap-1">
            <button onclick='itemForm(${JSON.stringify(m)})' class="p-1.5 bg-orange-50 text-orange-600 rounded-lg">✏️</button>
            <button onclick="delItem(${m.id})" class="p-1.5 bg-red-50 text-red-500 rounded-lg">🗑️</button>
          </div></td></tr>`).join('')}
        </tbody></table>
      <div class="px-4 py-2 bg-slate-50 text-xs text-slate-500">Jami: ${items.length} ta taom</div>
    </div>`;
}

async function itemForm(m) {
  const cats = STATE.data.cats || await api('/categories/');
  const printers = await api('/printers/');
  const w = modal(m?'✏️ Taomni tahrirlash':'➕ Yangi taom', `
    <form id="itemF" class="space-y-4">
      <div><label class="text-sm font-medium">Taom nomi *</label>
        <input id="if_name" value="${m?.name||''}" required class="w-full border rounded-lg px-3 py-2 mt-1" placeholder="Osh, Lag'mon..."></div>
      <div class="grid grid-cols-2 gap-3">
        <div><label class="text-sm font-medium">Kategoriya</label>
          <select id="if_cat" class="w-full border rounded-lg px-3 py-2 mt-1">
            <option value="">— Tanlang —</option>
            ${cats.map(c=>`<option value="${c.id}" ${m?.category==c.id?'selected':''}>${c.name}</option>`).join('')}
          </select></div>
        <div><label class="text-sm font-medium">🖨️ Printer (oshxona)</label>
          <select id="if_printer" class="w-full border rounded-lg px-3 py-2 mt-1">
            <option value="">— Yo'q —</option>
            ${printers.map(p=>`<option value="${p.id}" ${m?.printer==p.id?'selected':''}>${p.name}</option>`).join('')}
          </select></div>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div><label class="text-sm font-medium">Sotish narxi *</label>
          <input id="if_price" type="number" value="${m?.price||''}" required class="w-full border rounded-lg px-3 py-2 mt-1"></div>
        <div><label class="text-sm font-medium">Tannarx</label>
          <input id="if_cost" type="number" value="${m?.cost_price||0}" class="w-full border rounded-lg px-3 py-2 mt-1"></div>
      </div>
      <div><label class="text-sm font-medium">Tavsif</label>
        <textarea id="if_desc" class="w-full border rounded-lg px-3 py-2 mt-1" rows="2">${m?.description||''}</textarea></div>
      <label class="flex items-center gap-2"><input id="if_avail" type="checkbox" ${!m||m.is_available?'checked':''} class="w-4 h-4 accent-brand-500"> Menyuda ko'rinsin</label>
      <div class="flex gap-2 justify-end pt-2 border-t">
        <button type="button" data-close2 class="px-5 py-2 border rounded-lg">Bekor</button>
        <button class="px-5 py-2 bg-brand-500 text-white rounded-lg font-medium">💾 Saqlash</button>
      </div>
    </form>`, {size:'max-w-xl'});
  w.querySelector('[data-close2]').onclick = () => w.remove();
  w.querySelector('#itemF').onsubmit = async (e) => {
    e.preventDefault();
    const body = { name:if_name.value, category:if_cat.value||null, printer:if_printer.value||null,
      price:if_price.value, cost_price:if_cost.value||0, description:if_desc.value, is_available:if_avail.checked };
    try {
      if (m) await api('/menu/'+m.id+'/', {method:'PATCH', body});
      else await api('/menu/', {method:'POST', body});
      toast('Saqlandi!'); w.remove(); go('menu');
    } catch(err){ toast(err.message,'error'); }
  };
}
async function delItem(id){ if(!confirm("O'chirilsinmi?"))return; await api('/menu/'+id+'/',{method:'DELETE'}); toast("O'chirildi"); go('menu'); }

async function renderCats() {
  const cats = await api('/categories/');
  const body = document.getElementById('menuBody');
  body.innerHTML = !cats.length ? empty('📂','Kategoriyalar yo\'q') : `
    <div class="bg-white rounded-2xl border overflow-hidden"><table class="w-full text-sm">
      <thead class="bg-slate-50 border-b text-slate-500"><tr>
        <th class="text-left px-4 py-3">Nomi</th><th class="text-left px-4 py-3">Taomlar</th>
        <th class="text-left px-4 py-3">Holat</th><th class="px-4 py-3"></th></tr></thead><tbody>
      ${cats.map(c=>`<tr class="border-b hover:bg-orange-50">
        <td class="px-4 py-3 font-medium">${c.name}</td><td class="px-4 py-3 text-slate-500">${c.items_count} ta</td>
        <td class="px-4 py-3"><span class="px-2 py-0.5 rounded-full text-xs ${c.is_active?'bg-green-100 text-green-700':'bg-slate-100 text-slate-500'}">${c.is_active?'Faol':'Nofaol'}</span></td>
        <td class="px-4 py-3"><div class="flex gap-1">
          <button onclick='catForm(${JSON.stringify(c)})' class="p-1.5 bg-orange-50 text-orange-600 rounded-lg">✏️</button>
          <button onclick="delCat(${c.id})" class="p-1.5 bg-red-50 text-red-500 rounded-lg">🗑️</button></div></td></tr>`).join('')}
      </tbody></table></div>`;
}
async function catForm(c) {
  const w = modal(c?'✏️ Kategoriya':'➕ Yangi kategoriya', `
    <form id="catF" class="space-y-4">
      <div><label class="text-sm font-medium">Nomi *</label>
        <input id="cf_name" value="${c?.name||''}" required class="w-full border rounded-lg px-3 py-2 mt-1" placeholder="Salatlar, Ichimliklar..."></div>
      <div><label class="text-sm font-medium">Tartib</label>
        <input id="cf_order" type="number" value="${c?.order||0}" class="w-full border rounded-lg px-3 py-2 mt-1"></div>
      <label class="flex items-center gap-2"><input id="cf_active" type="checkbox" ${!c||c.is_active?'checked':''} class="w-4 h-4 accent-brand-500"> Faol</label>
      <div class="flex gap-2 justify-end pt-2 border-t">
        <button type="button" data-close2 class="px-5 py-2 border rounded-lg">Bekor</button>
        <button class="px-5 py-2 bg-brand-500 text-white rounded-lg font-medium">💾 Saqlash</button></div>
    </form>`);
  w.querySelector('[data-close2]').onclick = () => w.remove();
  w.querySelector('#catF').onsubmit = async (e) => {
    e.preventDefault();
    const body = {name:cf_name.value, order:cf_order.value||0, is_active:cf_active.checked};
    try { if(c) await api('/categories/'+c.id+'/',{method:'PATCH',body}); else await api('/categories/',{method:'POST',body});
      toast('Saqlandi!'); w.remove(); go('menu'); } catch(err){ toast(err.message,'error'); }
  };
}
async function delCat(id){ if(!confirm("O'chirilsinmi?"))return; await api('/categories/'+id+'/',{method:'DELETE'}); toast("O'chirildi"); go('menu'); }

async function renderPrinters() {
  const printers = await api('/printers/');
  const body = document.getElementById('menuBody');
  body.innerHTML = `
    <div class="bg-orange-50 border border-orange-200 rounded-xl p-4 text-sm text-orange-800 mb-4">
      💡 Har bir taomga printer tayinlang. Buyurtma berilganda taom o'sha oshxona printeriga chiqadi.</div>
    ${!printers.length ? empty('🖨️','Printerlar yo\'q') : `
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    ${printers.map(p=>`<div class="bg-white rounded-2xl border p-5">
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-3"><div class="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-xl">🖨️</div>
        <div><div class="font-semibold">${p.name}</div><div class="text-xs text-slate-500">${p.location||''}</div></div></div>
        <span class="px-2 py-0.5 rounded-full text-xs ${p.is_active?'bg-green-100 text-green-700':'bg-slate-100 text-slate-500'}">${p.is_active?'Faol':'Nofaol'}</span></div>
      <div class="flex gap-2 mt-3">
        <button onclick='printerForm(${JSON.stringify(p)})' class="flex-1 bg-orange-50 text-orange-600 py-1.5 rounded-lg text-xs">✏️ Tahrirlash</button>
        <button onclick="delPrinter(${p.id})" class="flex-1 bg-red-50 text-red-500 py-1.5 rounded-lg text-xs">🗑️ O'chirish</button></div>
      </div>`).join('')}</div>`}`;
}
async function printerForm(p) {
  const w = modal(p?'✏️ Printer':'🖨️ Yangi printer', `
    <form id="prF" class="space-y-4">
      <div><label class="text-sm font-medium">Printer nomi *</label>
        <input id="pf_name" value="${p?.name||''}" required class="w-full border rounded-lg px-3 py-2 mt-1" placeholder="Oshxona #1, Salat bar..."></div>
      <div><label class="text-sm font-medium">Joylashuv</label>
        <input id="pf_loc" value="${p?.location||''}" class="w-full border rounded-lg px-3 py-2 mt-1" placeholder="Asosiy oshxona..."></div>
      <label class="flex items-center gap-2"><input id="pf_active" type="checkbox" ${!p||p.is_active?'checked':''} class="w-4 h-4 accent-brand-500"> Faol</label>
      <div class="flex gap-2 justify-end pt-2 border-t">
        <button type="button" data-close2 class="px-5 py-2 border rounded-lg">Bekor</button>
        <button class="px-5 py-2 bg-brand-500 text-white rounded-lg font-medium">💾 Saqlash</button></div>
    </form>`);
  w.querySelector('[data-close2]').onclick = () => w.remove();
  w.querySelector('#prF').onsubmit = async (e) => {
    e.preventDefault();
    const body = {name:pf_name.value, location:pf_loc.value, is_active:pf_active.checked};
    try { if(p) await api('/printers/'+p.id+'/',{method:'PATCH',body}); else await api('/printers/',{method:'POST',body});
      toast('Saqlandi!'); w.remove(); go('menu'); } catch(err){ toast(err.message,'error'); }
  };
}
async function delPrinter(id){ if(!confirm("O'chirilsinmi?"))return; await api('/printers/'+id+'/',{method:'DELETE'}); toast("O'chirildi"); go('menu'); }

function empty(icon, text) {
  return `<div class="bg-white rounded-2xl border text-center py-16 text-slate-400">
    <div class="text-5xl mb-3">${icon}</div><p>${text}</p></div>`;
}



// ============================================================
//  STOLLAR (bosilganda menyu ochiladi)
// ============================================================
async function pageTables(c) {
  const tabs = await api('/tables/');
  c.innerHTML = `
    <div class="flex items-center justify-between mb-4">
      <div class="flex gap-4 text-xs text-slate-500 bg-white px-4 py-2 rounded-xl border">
        <span class="flex items-center gap-1"><span class="w-3 h-3 rounded bg-green-400"></span>Bo'sh</span>
        <span class="flex items-center gap-1"><span class="w-3 h-3 rounded bg-red-400"></span>Band</span>
        <span class="flex items-center gap-1">💡 Stolni bosing → buyurtma bering</span>
      </div>
      <button onclick="tableForm()" class="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium">+ Yangi stol</button>
    </div>
    ${!tabs.length ? empty('🪑','Stollar yo\'q') : `
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
    ${tabs.map(t=>`
      <div class="bg-white rounded-2xl border-2 ${t.status==='free'?'border-green-300':t.status==='occupied'?'border-red-300':'border-yellow-300'} p-4 hover:shadow-lg transition cursor-pointer"
           onclick="openTableOrder(${t.id}, ${t.number}, ${t.active_order||'null'})">
        <div class="text-center">
          <div class="text-3xl font-bold text-slate-800">#${t.number}</div>
          <div class="text-xs text-slate-500 mt-1">👥 ${t.capacity} kishi</div>
          ${t.location?`<div class="text-xs text-slate-400">📍 ${t.location}</div>`:''}
          <div class="mt-2"><span class="px-2 py-0.5 rounded-full text-xs ${t.status==='free'?'bg-green-100 text-green-700':t.status==='occupied'?'bg-red-100 text-red-600':'bg-yellow-100 text-yellow-700'}">
            ${t.status==='free'?"Bo'sh":t.status==='occupied'?'Band':'Bron'}</span></div>
          ${t.active_order?`<div class="text-xs text-brand-600 mt-1 font-medium">🧾 Buyurtma bor</div>`:''}
        </div>
        <button onclick="event.stopPropagation();tableForm(${JSON.stringify(t).replace(/"/g,'&quot;')})" class="w-full mt-2 text-xs text-slate-400 hover:text-slate-600">✏️ Tahrirlash</button>
      </div>`).join('')}</div>`}`;
}
async function tableForm(t) {
  const w = modal(t?'✏️ Stol':'➕ Yangi stol', `
    <form id="tblF" class="space-y-4">
      <div class="grid grid-cols-2 gap-3">
        <div><label class="text-sm font-medium">Stol raqami *</label>
          <input id="tf_num" type="number" value="${t?.number||''}" required class="w-full border rounded-lg px-3 py-2 mt-1"></div>
        <div><label class="text-sm font-medium">Sig'imi</label>
          <input id="tf_cap" type="number" value="${t?.capacity||4}" class="w-full border rounded-lg px-3 py-2 mt-1"></div>
      </div>
      <div><label class="text-sm font-medium">Joylashuv</label>
        <input id="tf_loc" value="${t?.location||''}" class="w-full border rounded-lg px-3 py-2 mt-1" placeholder="Zal, Teras, VIP..."></div>
      <div class="flex gap-2 justify-end pt-2 border-t">
        ${t?`<button type="button" onclick="delTable(${t.id})" class="px-5 py-2 bg-red-50 text-red-500 rounded-lg mr-auto">🗑️ O'chirish</button>`:''}
        <button type="button" data-close2 class="px-5 py-2 border rounded-lg">Bekor</button>
        <button class="px-5 py-2 bg-brand-500 text-white rounded-lg font-medium">💾 Saqlash</button></div>
    </form>`);
  w.querySelector('[data-close2]').onclick = () => w.remove();
  w.querySelector('#tblF').onsubmit = async (e) => {
    e.preventDefault();
    const body = {number:tf_num.value, capacity:tf_cap.value, location:tf_loc.value};
    try { if(t) await api('/tables/'+t.id+'/',{method:'PATCH',body}); else await api('/tables/',{method:'POST',body});
      toast('Saqlandi!'); w.remove(); go('tables'); } catch(err){ toast(err.message,'error'); }
  };
}
async function delTable(id){ if(!confirm("O'chirilsinmi?"))return; await api('/tables/'+id+'/',{method:'DELETE'}); go('tables'); document.querySelector('.fixed')?.remove(); }

// Stol bosilganda — agar buyurtma bor bo'lsa ochish, yo'q bo'lsa yangi
async function openTableOrder(tableId, tableNum, activeOrderId) {
  if (activeOrderId) {
    const o = await api('/orders/'+activeOrderId+'/');
    orderCart(o);
  } else {
    orderCart(null, {order_type:'dine_in', table:tableId, table_number:tableNum});
  }
}

// ============================================================
//  BUYURTMA SAVATCHASI (menyu + savat)
// ============================================================
async function orderCart(existingOrder, newMeta) {
  const [menu, cats] = await Promise.all([api('/menu/?'), api('/categories/')]);
  const available = menu.filter(m=>m.is_available);
  let cart = existingOrder ? existingOrder.items.map(i=>({id:i.menu_item, name:i.name, price:i.price, qty:i.quantity})) : [];
  let selCat = null;
  const meta = existingOrder ? {order_type:existingOrder.order_type, table:existingOrder.table, table_number:existingOrder.table_number,
    customer_name:existingOrder.customer_name, customer_phone:existingOrder.customer_phone, address:existingOrder.address} : (newMeta||{order_type:'dine_in'});

  const title = existingOrder ? `🧾 ${existingOrder.number}` + (meta.table_number?` · Stol #${meta.table_number}`:'') :
    (meta.table_number?`🪑 Stol #${meta.table_number} — Buyurtma`:'➕ Yangi buyurtma');
  const w = modal(title, '<div id="cartBody"></div>', {size:'max-w-4xl'});

  function draw() {
    const total = cart.reduce((s,i)=>s+i.price*i.qty,0);
    const catItems = available.filter(m=>!selCat || m.category===selCat);
    document.getElementById('cartBody').innerHTML = `
      <div class="grid grid-cols-5 gap-4" style="max-height:65vh">
        <div class="col-span-3 flex flex-col overflow-hidden">
          <div class="flex gap-1.5 flex-wrap mb-3">
            <button onclick="window._setCat(null)" class="px-3 py-1 rounded-full text-xs ${!selCat?'bg-brand-500 text-white':'bg-slate-100'}">Barchasi</button>
            ${cats.map(c=>`<button onclick="window._setCat(${c.id})" class="px-3 py-1 rounded-full text-xs ${selCat===c.id?'bg-brand-500 text-white':'bg-slate-100'}">${c.name}</button>`).join('')}
          </div>
          <div class="grid grid-cols-2 gap-2 overflow-y-auto pr-1">
            ${catItems.map(m=>`<button onclick='window._add(${m.id})' class="text-left p-3 border-2 border-transparent hover:border-brand-300 hover:bg-orange-50 rounded-xl bg-white">
              <div class="font-medium text-xs">${m.name}</div>
              <div class="text-brand-600 font-bold text-xs mt-0.5">${money(m.price)}</div>
              ${m.printer_name?`<div class="text-[10px] text-purple-500">🖨️ ${m.printer_name}</div>`:''}
            </button>`).join('') || '<div class="col-span-2 text-center text-slate-400 py-8 text-sm">Taom yo\'q</div>'}
          </div>
        </div>
        <div class="col-span-2 flex flex-col border-l pl-4">
          ${!existingOrder ? `<div class="space-y-2 mb-2">
            ${meta.order_type!=='dine_in'?`
            <input id="oc_name" placeholder="Mijoz ismi (ixtiyoriy)" value="${meta.customer_name||''}" class="w-full border rounded-lg px-2 py-1.5 text-sm">
            <input id="oc_phone" placeholder="Telefon (ixtiyoriy)" value="${meta.customer_phone||''}" class="w-full border rounded-lg px-2 py-1.5 text-sm">`:''}
            ${meta.order_type==='delivery'?`<input id="oc_addr" placeholder="Manzil" value="${meta.address||''}" class="w-full border rounded-lg px-2 py-1.5 text-sm">`:''}
          </div>`:''}
          <div class="text-xs font-semibold text-slate-500 mb-1">SAVAT</div>
          <div class="flex-1 overflow-y-auto">
            ${cart.length?cart.map((i,idx)=>`<div class="flex items-center gap-2 py-1.5 border-b">
              <span class="flex-1 text-xs font-medium">${i.name}</span>
              <button onclick="window._qty(${idx},-1)" class="w-5 h-5 bg-slate-100 rounded">−</button>
              <span class="text-xs font-bold w-5 text-center">${i.qty}</span>
              <button onclick="window._qty(${idx},1)" class="w-5 h-5 bg-slate-100 rounded">+</button>
              <span class="text-xs text-brand-600 w-16 text-right">${money(i.price*i.qty)}</span>
            </div>`).join(''):'<div class="text-xs text-slate-400 text-center py-4">Taom tanlang</div>'}
          </div>
          <div class="border-t pt-2 mt-2">
            <div class="flex justify-between font-bold mb-3"><span>Jami:</span><span class="text-brand-600">${money(total)}</span></div>
            <div class="flex gap-2">
              <button data-close3 class="flex-1 py-2 border rounded-lg text-sm">Yopish</button>
              <button onclick="window._save()" class="flex-1 py-2 bg-brand-500 text-white rounded-lg text-sm font-medium">✅ ${existingOrder?'Qo\'shish':'Buyurtma'}</button>
            </div>
          </div>
        </div>
      </div>`;
    w.querySelector('[data-close3]').onclick = () => { w.remove(); go(STATE.page); };
  }
  window._setCat = (id)=>{ selCat=id; draw(); };
  window._add = (id)=>{ const m=available.find(x=>x.id===id); const ex=cart.find(x=>x.id===id);
    if(ex){ex.qty++;}else{cart.push({id:m.id,name:m.name,price:m.price,qty:1});} draw(); };
  window._qty = (idx,d)=>{ cart[idx].qty+=d; if(cart[idx].qty<=0)cart.splice(idx,1); draw(); };
  window._save = async ()=>{
    if(!cart.length){ toast('Taom tanlang!','error'); return; }
    try {
      if (existingOrder) {
        for (const i of cart) {
          const orig = existingOrder.items.find(x=>x.menu_item===i.id);
          const origQty = orig?orig.quantity:0;
          if (i.qty>origQty) await api('/orders/'+existingOrder.id+'/items/',{method:'POST',body:{menu_item:i.id,quantity:i.qty-origQty}});
        }
        toast('Buyurtmaga qo\'shildi!');
      } else {
        const body = {order_type:meta.order_type, table:meta.table||null,
          customer_name:document.getElementById('oc_name')?.value||'',
          customer_phone:document.getElementById('oc_phone')?.value||'',
          address:document.getElementById('oc_addr')?.value||'',
          items:cart.map(i=>({menu_item:i.id, quantity:i.qty}))};
        await api('/orders/',{method:'POST',body});
        toast('Buyurtma yaratildi!');
      }
      w.remove(); go(STATE.page);
    } catch(err){ toast(err.message,'error'); }
  };
  draw();
}



// ============================================================
//  BUYURTMALAR (3 bo'lim: Stol / Olib ketish / Masofadan)
// ============================================================
async function pageOrders(c) {
  const type = STATE.data.orderType || 'dine_in';
  const all = await api('/orders/');
  const active = all.filter(o=>!['completed','cancelled'].includes(o.status));
  const cnt = (t)=>active.filter(o=>o.order_type===t).length;
  const TABS = [
    {k:'dine_in', l:'Stol', icon:'🪑', bg:'bg-brand-500'},
    {k:'takeaway', l:'Olib ketish', icon:'🛍️', bg:'bg-blue-500'},
    {k:'delivery', l:'Masofadan', icon:'🛵', bg:'bg-green-500'},
  ];
  const orders = all.filter(o=>o.order_type===type);

  c.innerHTML = `
    <div class="grid grid-cols-3 gap-4 mb-5">
      ${TABS.map(t=>`<button onclick="STATE.data.orderType='${t.k}';go('orders')"
        class="flex items-center gap-3 p-4 rounded-2xl border-2 transition ${type===t.k?t.bg+' text-white border-transparent shadow-lg':'bg-white border-slate-200 hover:border-slate-300'}">
        <div class="w-11 h-11 rounded-xl flex items-center justify-center text-2xl ${type===t.k?'bg-white/20':'bg-slate-50'}">${t.icon}</div>
        <div class="text-left"><div class="font-bold ${type===t.k?'text-white':'text-slate-800'}">${t.l}</div>
        ${cnt(t.k)?`<div class="text-xs ${type===t.k?'text-white/80':'text-slate-500'}">${cnt(t.k)} ta faol</div>`:''}</div>
        ${cnt(t.k)?`<span class="ml-auto w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${type===t.k?'bg-white text-brand-600':t.bg+' text-white'}">${cnt(t.k)}</span>`:''}
      </button>`).join('')}
    </div>
    <div class="flex justify-between items-center mb-3">
      <h3 class="font-semibold text-slate-700">${TABS.find(t=>t.k===type).icon} ${TABS.find(t=>t.k===type).l} buyurtmalari</h3>
      ${type!=='dine_in'?`<button onclick="newRemoteOrder('${type}')" class="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium">+ Yangi buyurtma</button>`:
        `<span class="text-xs text-slate-400">Stol buyurtmasi "Stollar" bo'limidan beriladi</span>`}
    </div>
    ${!orders.length ? empty(TABS.find(t=>t.k===type).icon,'Buyurtmalar yo\'q') : `
    <div class="bg-white rounded-2xl border overflow-hidden"><table class="w-full text-sm">
      <thead class="bg-slate-50 border-b text-slate-500"><tr>
        <th class="text-left px-4 py-3">Raqam</th>
        ${type==='dine_in'?'<th class="text-left px-4 py-3">Stol</th>':'<th class="text-left px-4 py-3">Mijoz</th>'}
        <th class="text-left px-4 py-3">Summa</th><th class="text-left px-4 py-3">Status</th>
        <th class="text-left px-4 py-3">Vaqt</th><th class="px-4 py-3"></th></tr></thead><tbody>
      ${orders.map(o=>`<tr class="border-b hover:bg-orange-50">
        <td class="px-4 py-3 font-bold text-brand-600">${o.number}</td>
        ${type==='dine_in'?`<td class="px-4 py-3">${o.table_number?'Stol #'+o.table_number:'—'}</td>`:
          `<td class="px-4 py-3"><div>${o.customer_name||'—'}</div><div class="text-xs text-slate-400">${o.customer_phone||''}</div></td>`}
        <td class="px-4 py-3 font-semibold">${money(o.total)}</td>
        <td class="px-4 py-3">${statusBadge(o.status)}</td>
        <td class="px-4 py-3 text-xs text-slate-400">${new Date(o.created_at).toLocaleTimeString('uz-UZ',{hour:'2-digit',minute:'2-digit'})}</td>
        <td class="px-4 py-3"><div class="flex gap-1 justify-end">
          <button onclick="viewOrder(${o.id})" class="p-1.5 bg-blue-50 text-blue-500 rounded-lg">👁️</button>
          ${o.status!=='completed'&&o.status!=='cancelled'?`<button onclick="payOrder(${o.id})" class="px-2 py-1 bg-green-500 text-white rounded-lg text-xs">💰 To'lov</button>`:''}
        </div></td></tr>`).join('')}
      </tbody></table></div>`}`;
}

function statusBadge(s) {
  const m = {pending:['Kutilmoqda','bg-yellow-100 text-yellow-700'],preparing:['Tayyorlanmoqda','bg-orange-100 text-orange-700'],
    ready:['Tayyor','bg-green-100 text-green-700'],completed:['Yakunlangan','bg-slate-100 text-slate-600'],
    cancelled:['Bekor','bg-red-100 text-red-600']};
  const [t,cls] = m[s]||[s,'bg-slate-100'];
  return `<span class="px-2 py-0.5 rounded-full text-xs ${cls}">${t}</span>`;
}

async function newRemoteOrder(type) { orderCart(null, {order_type:type}); }

async function viewOrder(id) {
  const o = await api('/orders/'+id+'/');
  orderCart(o);
}

async function payOrder(id) {
  const o = await api('/orders/'+id+'/');
  let method = 'cash';
  const w = modal('💰 To\'lov — '+o.number, `
    <div class="space-y-4">
      <div class="bg-slate-50 rounded-xl p-4">
        ${o.items.map(i=>`<div class="flex justify-between text-sm py-1"><span>${i.name} x${i.quantity}</span><span>${money(i.price*i.quantity)}</span></div>`).join('')}
        <div class="border-t mt-2 pt-2 flex justify-between font-bold"><span>JAMI:</span><span class="text-brand-600 text-lg">${money(o.total)}</span></div>
      </div>
      <div><div class="text-sm font-medium mb-2">To'lov usuli</div>
        <div class="grid grid-cols-2 gap-2" id="payMethods">
          ${[['cash','💵 Naqd'],['card','💳 Karta'],['payme','📱 Payme'],['click','📱 Click']].map((m,i)=>`
            <button data-m="${m[0]}" class="paym flex items-center gap-2 p-3 rounded-lg border-2 ${i===0?'border-brand-500 bg-orange-50':'border-slate-200'}">${m[1]}</button>`).join('')}
        </div></div>
      <div><label class="text-sm font-medium">Qabul qilingan</label>
        <input id="pay_amount" type="number" value="${o.total}" class="w-full border rounded-lg px-3 py-2 mt-1 text-lg font-bold"></div>
      <div id="changeBox" class="hidden bg-green-50 border border-green-200 rounded-lg p-3 text-center text-green-700 font-semibold"></div>
      <div class="flex gap-2">
        <button data-close2 class="flex-1 py-2 border rounded-lg">Bekor</button>
        <button id="payBtn" class="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium">✅ To'lovni qabul qilish</button>
      </div>
    </div>`);
  w.querySelector('[data-close2]').onclick = () => w.remove();
  w.querySelectorAll('.paym').forEach(b=>b.onclick=()=>{
    method=b.dataset.m; w.querySelectorAll('.paym').forEach(x=>x.className='paym flex items-center gap-2 p-3 rounded-lg border-2 border-slate-200');
    b.className='paym flex items-center gap-2 p-3 rounded-lg border-2 border-brand-500 bg-orange-50';
  });
  const amt = w.querySelector('#pay_amount'); const cb = w.querySelector('#changeBox');
  amt.oninput = ()=>{ const ch=Number(amt.value)-Number(o.total); if(ch>=0&&method==='cash'){cb.classList.remove('hidden');cb.textContent='Qaytim: '+money(ch);}else cb.classList.add('hidden'); };
  w.querySelector('#payBtn').onclick = async ()=>{
    try { const r = await api('/orders/'+id+'/pay/',{method:'POST',body:{method,paid:amt.value}});
      toast('To\'lov qabul qilindi!'+(r.change>0?' Qaytim: '+money(r.change):'')); w.remove(); go('orders'); }
    catch(err){ toast(err.message,'error'); }
  };
}

// ============================================================
//  OSHXONA (printer bo'yicha)
// ============================================================
async function pageKitchen(c) {
  const orders = await api('/kitchen/');
  c.innerHTML = !orders.length ? empty('👨‍🍳','Tayyorlanadigan buyurtma yo\'q') : `
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    ${orders.map(o=>{
      const elapsed = Math.floor((Date.now()-new Date(o.created_at))/60000);
      return `<div class="bg-white rounded-2xl border-2 ${o.status==='ready'?'border-green-300':'border-orange-300'} p-4">
        <div class="flex items-center justify-between mb-3">
          <div><div class="font-bold text-lg">${o.number}</div>
          <div class="text-xs text-slate-500">${o.table_number?'Stol #'+o.table_number:o.order_type==='takeaway'?'Olib ketish':'Masofadan'}</div></div>
          <div class="text-right"><div class="text-sm font-medium ${elapsed>20?'text-red-600':elapsed>10?'text-orange-600':'text-green-600'}">⏱️ ${elapsed} daq</div></div>
        </div>
        <div class="space-y-1.5">
          ${o.items.map(i=>`<div class="flex items-center justify-between p-2 rounded-lg border ${i.status==='ready'?'bg-green-50 border-green-200':'bg-slate-50 border-slate-200'}">
            <div class="flex-1"><span class="text-sm font-medium">${i.name}</span> <span class="text-xs text-slate-400">x${i.quantity}</span>
              ${i.printer_name?`<div class="text-[10px] text-purple-500">🖨️ ${i.printer_name}</div>`:''}
              ${i.note?`<div class="text-[10px] italic text-slate-400">${i.note}</div>`:''}</div>
            ${i.status!=='ready'?`<button onclick="kitchenReady(${i.id})" class="text-xs bg-green-500 text-white px-2 py-1 rounded-lg">✓ Tayyor</button>`:'<span class="text-green-500">✓</span>'}
          </div>`).join('')}
        </div>
        <div class="flex gap-2 mt-3">
          <button onclick="setOrderStatus(${o.id},'preparing')" class="flex-1 text-xs bg-orange-100 text-orange-700 py-1.5 rounded-lg">🔥 Tayyorlanmoqda</button>
          <button onclick="setOrderStatus(${o.id},'ready')" class="flex-1 text-xs bg-green-100 text-green-700 py-1.5 rounded-lg">✓ Tayyor</button>
        </div>
      </div>`}).join('')}</div>`;
}
async function kitchenReady(itemId){ await api('/kitchen/item/'+itemId+'/',{method:'PATCH',body:{status:'ready'}}); go('kitchen'); }
async function setOrderStatus(id,status){ await api('/orders/'+id+'/',{method:'PATCH',body:{status}}); toast('Yangilandi'); go('kitchen'); }

// Auto-refresh oshxona
setInterval(()=>{ if(STATE.page==='kitchen') go('kitchen'); }, 20000);
