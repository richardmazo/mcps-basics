/* ===== main.js — Pádel Club ===== */

// ── LocalStorage helpers ─────────────────────────────────────────────────────
const LS_KEY = 'padelclub_reservas';

function cargarReservas() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY)) || [];
  } catch {
    return [];
  }
}

function guardarReservas(reservas) {
  localStorage.setItem(LS_KEY, JSON.stringify(reservas));
}

// ── Renderizar tabla ─────────────────────────────────────────────────────────
function renderTabla() {
  const reservas = cargarReservas();
  const tbody    = document.getElementById('tablaBody');
  const vacia    = document.getElementById('tablaVacia');
  const tabla    = document.getElementById('tablaReservas');
  const countEl  = document.getElementById('reservasCount');

  // Actualizar contador
  countEl.textContent = reservas.length === 1
    ? '1 reserva'
    : `${reservas.length} reservas`;

  if (reservas.length === 0) {
    tabla.style.display = 'none';
    vacia.classList.add('visible');
    return;
  }

  tabla.style.display = 'table';
  vacia.classList.remove('visible');

  tbody.innerHTML = reservas.map((r, i) => `
    <tr id="fila-${r.id}">
      <td>${i + 1}</td>
      <td>${escapar(r.nombre)}</td>
      <td class="td-pista">${escapar(r.pista)}</td>
      <td class="td-fecha">${formatFecha(r.fecha)}</td>
      <td class="td-hora">${escapar(r.hora)}h</td>
      <td class="td-registrada">${formatTimestamp(r.timestamp)}</td>
      <td><button class="btn-eliminar-fila" onclick="eliminarReserva('${r.id}')">✕ Eliminar</button></td>
    </tr>
  `).join('');
}

function escapar(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

// ── Eliminar una reserva ─────────────────────────────────────────────────────
function eliminarReserva(id) {
  const reservas = cargarReservas().filter(r => r.id !== id);
  guardarReservas(reservas);

  // Animación de salida
  const fila = document.getElementById(`fila-${id}`);
  if (fila) {
    fila.style.transition = 'opacity 0.3s, transform 0.3s';
    fila.style.opacity = '0';
    fila.style.transform = 'translateX(-10px)';
    setTimeout(renderTabla, 320);
  } else {
    renderTabla();
  }
}

// ── Borrar todas las reservas ────────────────────────────────────────────────
function limpiarReservas() {
  if (!confirm('¿Seguro que quieres borrar todas las reservas?')) return;
  guardarReservas([]);
  renderTabla();
}

// ── Formato de fecha y timestamp ─────────────────────────────────────────────
function formatFecha(isoDate) {
  if (!isoDate) return '—';
  const [y, m, d] = isoDate.split('-');
  return `${d}/${m}/${y}`;
}

function formatTimestamp(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
    + ' ' + d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

// ── Contador animado en el hero ──────────────────────────────────────────────
function animarContador(elemento, objetivo, duracion = 2000) {
  let inicio = null;
  const paso = (timestamp) => {
    if (!inicio) inicio = timestamp;
    const progreso = Math.min((timestamp - inicio) / duracion, 1);
    const easeOut  = 1 - Math.pow(1 - progreso, 3);
    elemento.textContent = Math.floor(easeOut * objetivo).toLocaleString();
    if (progreso < 1) requestAnimationFrame(paso);
  };
  requestAnimationFrame(paso);
}

const contadorEl = document.getElementById('contador');
const observer   = new IntersectionObserver(([entry]) => {
  if (entry.isIntersecting) {
    animarContador(contadorEl, 1248);
    observer.disconnect();
  }
}, { threshold: 0.3 });
observer.observe(contadorEl);

// ── Navbar: ocultar / mostrar al hacer scroll ────────────────────────────────
let lastScroll = 0;
const navbar   = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  const current = window.scrollY;
  navbar.style.transform = (current > lastScroll && current > 80)
    ? 'translateY(-100%)'
    : 'translateY(0)';
  lastScroll = current;
});
navbar.style.transition = 'transform 0.3s ease';

// ── Menú hamburguesa (móvil) ─────────────────────────────────────────────────
function toggleMenu() {
  const navLinks = document.querySelector('.nav-links');
  const isOpen   = navLinks.style.display === 'flex';
  Object.assign(navLinks.style, {
    display:       isOpen ? 'none' : 'flex',
    flexDirection: 'column',
    position:      'absolute',
    top:           '70px',
    left:          '0',
    right:         '0',
    background:    '#111',
    padding:       '20px 24px',
    gap:           '20px',
    zIndex:        '99',
    borderBottom:  '1px solid #222',
  });
}

document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    if (window.innerWidth <= 768)
      document.querySelector('.nav-links').style.display = 'none';
  });
});

// ── Pistas: abrir modal con pista preseleccionada ────────────────────────────
document.querySelectorAll('.pista-card').forEach(card => {
  card.addEventListener('click', () => {
    abrirModal();
    const selectPista = document.getElementById('pista');
    const pistaNombre = card.dataset.pista;
    for (const option of selectPista.options) {
      if (option.text === pistaNombre) { option.selected = true; break; }
    }
  });
});

// ── Modal de reserva ─────────────────────────────────────────────────────────
function abrirModal() {
  document.getElementById('modalOverlay').classList.add('active');
  document.body.style.overflow = 'hidden';
  const hoy = new Date().toISOString().split('T')[0];
  document.getElementById('fecha').min   = hoy;
  document.getElementById('fecha').value = hoy;
  document.getElementById('reserva-msg').textContent = '';
}

function cerrarModal() {
  document.getElementById('modalOverlay').classList.remove('active');
  document.body.style.overflow = '';
}

function cerrarModalOverlay(e) {
  if (e.target === document.getElementById('modalOverlay')) cerrarModal();
}

function confirmarReserva() {
  const nombre = document.getElementById('nombre').value.trim();
  const pista  = document.getElementById('pista').value;
  const fecha  = document.getElementById('fecha').value;
  const hora   = document.getElementById('hora').value;
  const msg    = document.getElementById('reserva-msg');

  if (!nombre) {
    msg.style.color   = '#ff5050';
    msg.textContent   = '⚠️ Por favor escribe tu nombre.';
    return;
  }
  if (!fecha) {
    msg.style.color   = '#ff5050';
    msg.textContent   = '⚠️ Selecciona una fecha.';
    return;
  }

  // Guardar en localStorage
  const reservas = cargarReservas();
  const nueva = {
    id:        Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    nombre,
    pista,
    fecha,
    hora,
    timestamp: Date.now(),
  };
  reservas.push(nueva);
  guardarReservas(reservas);
  renderTabla();

  msg.style.color = '#c6f135';
  msg.textContent = `✅ ¡Reserva confirmada! ${nombre} — ${pista} el ${formatFecha(fecha)} a las ${hora}h.`;

  setTimeout(() => {
    document.getElementById('nombre').value = '';
    cerrarModal();
  }, 2500);
}

// ── Animación de entrada en tarjetas ─────────────────────────────────────────
const cards       = document.querySelectorAll('.pista-card, .clase-card');
const cardObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity   = '1';
      entry.target.style.transform = 'translateY(0)';
      cardObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

cards.forEach(card => {
  card.style.opacity    = '0';
  card.style.transform  = 'translateY(24px)';
  card.style.transition = 'opacity 0.5s ease, transform 0.5s ease, border-color 0.25s';
  cardObserver.observe(card);
});

// ── Cerrar modal con Escape ───────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') cerrarModal();
});

// ── Inicializar tabla al cargar ───────────────────────────────────────────────
renderTabla();
