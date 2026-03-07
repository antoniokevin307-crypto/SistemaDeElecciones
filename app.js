// ==========================================
// ESTADO GLOBAL
// ==========================================
let globalPartidos = [];
let editModeId = null;
let TOTAL_ELECTORES_ESTIMADO = 80680; // Padrón total exacto

const CENSO_DISTRITOS = {
    "Berlín": 15340,
    "Santiago de María": 23176,
    "Jucuapa": 11351,
    "Mercedes Umaña": 8554,
    "Alegría": 4720,
    "Estanzuelas": 6239,
    "Nueva Granada": 4500,
    "El Triunfo": 3500,
    "San Buenaventura": 3300
};

const CENSO_CENTROS = {
    // Santiago de María
    "Centro Escolar Baltazar Parada": 5198,
    "Centro Escolar Católico Santa Clara de Asís": 2409,
    "Centro Escolar Cantón Las Flores": 961,
    "Centro Escolar Católico Obispo Castro Ramírez": 1114,
    "Parque Central San Rafael": 13494,
    // Berlín
    "Centro Escolar Cantón El Corozal": 397,
    "Centro Escolar Cantón Los Talpetates": 988,
    "Centro Escolar Cantón Loma Alta": 1802,
    "Centro urbano Calle Guandique y Simón Bolívar": 12153,
    // Resto
    "Centro Escolar Profesor Saúl Flores": 11351,
    "Parque Central de Mercedes Umaña": 8554,
    "Parque Central Manuel Enrique Araujo": 4720,
    "Parque Central y Portales de Estanzuelas": 6239,
    "Centro Escolar principal de Nueva Granada": 4500,
    "Casa comunal / Centro Escolar municipal": 3500,
    "Parque Central San Buenaventura": 3300
};

const ESTRUCTURA_GEOGRAFICA_SV = {
    "Usulután": {
        "Usulután Norte": {
            "Berlín": [
                "Centro Escolar Cantón El Corozal",
                "Centro Escolar Cantón Los Talpetates",
                "Centro Escolar Cantón Loma Alta",
                "Centro urbano Calle Guandique y Simón Bolívar"
            ],
            "Santiago de María": [
                "Centro Escolar Baltazar Parada",
                "Centro Escolar Católico Santa Clara de Asís",
                "Centro Escolar Cantón Las Flores",
                "Centro Escolar Católico Obispo Castro Ramírez",
                "Parque Central San Rafael"
            ],
            "Jucuapa": [
                "Centro Escolar Profesor Saúl Flores"
            ],
            "Mercedes Umaña": [
                "Parque Central de Mercedes Umaña"
            ],
            "Alegría": [
                "Parque Central Manuel Enrique Araujo"
            ],
            "Estanzuelas": [
                "Parque Central y Portales de Estanzuelas"
            ],
            "Nueva Granada": [
                "Centro Escolar principal de Nueva Granada"
            ],
            "El Triunfo": [
                "Casa comunal / Centro Escolar municipal"
            ],
            "San Buenaventura": [
                "Parque Central San Buenaventura"
            ]
        }
    }
};

// ==========================================
// HELPERS COMUNES
// ==========================================
function showAlert(elementId, message, type) {
    const alertEl = document.getElementById(elementId);
    if (!alertEl) return;
    alertEl.textContent = message;
    alertEl.className = `alert alert-${type}`;
    alertEl.classList.remove('hidden');
    setTimeout(() => { alertEl.classList.add('hidden'); }, 5000);
}

// Cargar Partidos desde Supabase
async function loadPartidos() {
    // Optimización: Cache de partidos
    if (globalPartidos && globalPartidos.length > 0) return globalPartidos;

    const { data, error } = await supabaseClient.from('partidos').select('*').order('created_at', { ascending: true });
    if (error) {
        console.error("Error cargando partidos:", error);
        return [];
    }
    globalPartidos = data || [];
    return globalPartidos;
}

// Helper para debouncing de funciones
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Función Central de Auditoría
async function logAuditoria(evento, tabla, detalles = {}) {
    try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        const operador = session ? session.user.email : 'Sistema/Desconocido';

        // Obtener IP (opcional, usando servicio público rápido)
        let ip = '0.0.0.0';
        try {
            const resp = await fetch('https://api.ipify.org?format=json');
            const json = await resp.json();
            ip = json.ip;
        } catch (e) { console.warn("No se pudo obtener IP:", e); }

        await supabaseClient.from('auditoria').insert([{
            operador,
            evento,
            tabla,
            ip_address: ip,
            detalles: detalles
        }]);
    } catch (err) {
        console.error("Error en Auditoría:", err);
    }
}

// ==========================================
// LÓGICA DEL DASHBOARD PÚBLICO (index.html)
// ==========================================
async function initDashboard() {
    console.log("Iniciando Dashboard Usulután Norte...");
    initCharts(); // from charts.js
    const partidos = await loadPartidos();

    // Lógica de Filtros Dinámicos
    const dSelect = document.getElementById('filter-distrito-dash');
    const cSelect = document.getElementById('filter-centro-dash');

    if (dSelect && cSelect) {
        dSelect.addEventListener('change', async (e) => {
            const depto = "Usulután";
            const zona = "Usulután Norte";
            const distrito = e.target.value;

            // Limpiar y poblar centros
            cSelect.innerHTML = '<option value="">Todos los Centros</option>';
            if (distrito && ESTRUCTURA_GEOGRAFICA_SV[depto][zona][distrito]) {
                const centros = ESTRUCTURA_GEOGRAFICA_SV[depto][zona][distrito];
                centros.forEach(c => {
                    const opt = document.createElement('option');
                    opt.value = c;
                    opt.textContent = c;
                    cSelect.appendChild(opt);
                });
                cSelect.disabled = false;
            } else {
                cSelect.disabled = true;
            }

            await renderDashboardData(partidos);
        });

        cSelect.addEventListener('change', async () => {
            await renderDashboardData(partidos);
        });
    }

    // Easter Egg
    let clickCount = 0;
    const logo = document.getElementById('nav-brand-logo');
    if (logo) {
        logo.addEventListener('click', (e) => {
            e.preventDefault();
            clickCount++;
            if (clickCount >= 5) window.location.href = 'login.html';
            setTimeout(() => { clickCount = 0; }, 3000);
        });
    }

    setupRealtimeSubscription(partidos);
    await renderDashboardData(partidos);
}

async function renderDashboardData(partidos) {
    const tablaRes = document.getElementById('tabla-resultados');
    const dSelect = document.getElementById('filter-distrito-dash');
    const cSelect = document.getElementById('filter-centro-dash');

    const selDistrito = dSelect?.value || null;
    const selCentro = cSelect?.value || null;

    // 1. Obtener total de actas procesadas con filtro
    let queryActas = supabaseClient.from('actas').select('*', { count: 'exact', head: true });
    if (selDistrito) queryActas = queryActas.eq('municipio', selDistrito); // usamos municipio para distrito
    if (selCentro) queryActas = queryActas.eq('centro_votacion', selCentro);

    const { count: countActas, error: errActas } = await queryActas;

    // 2. Obtener sumatoria de votos
    // Para filtrar votos por geografía necesitamos unir con actas
    let queryVotos = supabaseClient.from('votos').select('cantidad, partido_id, actas!inner(municipio, centro_votacion)');
    if (selDistrito) queryVotos = queryVotos.eq('actas.municipio', selDistrito);
    if (selCentro) queryVotos = queryVotos.eq('actas.centro_votacion', selCentro);

    const { data: votosData, error: errVotos } = await queryVotos;

    if (errVotos || errActas) {
        console.error("Error obteniendo datos:", errVotos || errActas);
        return;
    }

    // Calcular Votos por partido
    let votosTotalesHaciaPartido = {};
    let granTotalVotos = 0;
    partidos.forEach(p => { votosTotalesHaciaPartido[p.id] = 0; });

    (votosData || []).forEach(voto => {
        votosTotalesHaciaPartido[voto.partido_id] = (votosTotalesHaciaPartido[voto.partido_id] || 0) + voto.cantidad;
        granTotalVotos += voto.cantidad;
    });

    // Actualizar KPIs
    document.getElementById('stat-total-votos').textContent = granTotalVotos.toLocaleString();
    document.getElementById('stat-actas').textContent = countActas ? countActas.toLocaleString() : '0';

    // Participación dinámica
    let censoActual = TOTAL_ELECTORES_ESTIMADO;
    let contextLabel = "(Municipio)";

    if (selCentro && CENSO_CENTROS[selCentro]) {
        censoActual = CENSO_CENTROS[selCentro];
        contextLabel = `(${selCentro})`;
    } else if (selDistrito && CENSO_DISTRITOS[selDistrito]) {
        censoActual = CENSO_DISTRITOS[selDistrito];
        contextLabel = `(${selDistrito})`;
    }

    document.getElementById('txt-participacion-context').textContent = contextLabel;

    const participacionNum = granTotalVotos > 0 ? (granTotalVotos / censoActual) * 100 : 0;
    const participacionStr = participacionNum.toFixed(2);

    const statPart = document.getElementById('stat-participacion');
    const progPart = document.getElementById('progress-participacion');

    // Resetear estilos base
    statPart.style.color = 'var(--text-main)';
    progPart.style.background = 'var(--primary-gradient)';
    statPart.textContent = participacionStr + '%';

    if (participacionNum > 100) {
        statPart.style.color = '#DC2626'; // Rojo Intenso
        statPart.innerHTML = `${participacionStr}% <div style="font-size: 0.65rem; color: #DC2626; font-weight: 900; margin-top: -5px;">¡EXCEDIDO!</div>`;
        progPart.style.background = 'var(--danger-gradient)';
    } else if (participacionNum >= 100) {
        statPart.style.color = '#059669'; // Verde Esmeralda
        progPart.style.background = 'var(--success-gradient)';
    }

    progPart.style.width = Math.min(participacionNum, 100) + '%';

    // Calcular Ganadores por Zona para el Bar Chart
    let dataTendencia = {}; // { zonaName: { partidoId: totalVotos } }
    (votosData || []).forEach(voto => {
        const zonaKey = selDistrito ? voto.actas.centro_votacion : voto.actas.municipio;
        if (!dataTendencia[zonaKey]) dataTendencia[zonaKey] = {};
        dataTendencia[zonaKey][voto.partido_id] = (dataTendencia[zonaKey][voto.partido_id] || 0) + voto.cantidad;
    });

    // Convertir a Ganador por Zona
    let labelsBar = [];
    let barValues = [];
    let barColors = [];
    let barPartyNames = [];

    Object.keys(dataTendencia).forEach(zona => {
        labelsBar.push(zona);
        // Encontrar partido ganador en esta zona
        let maxVotos = -1;
        let winnerId = null;
        Object.keys(dataTendencia[zona]).forEach(pid => {
            if (dataTendencia[zona][pid] > maxVotos) {
                maxVotos = dataTendencia[zona][pid];
                winnerId = pid;
            }
        });

        const winnerParty = partidos.find(p => p.id == winnerId);
        barValues.push(maxVotos);
        barColors.push(winnerParty ? winnerParty.color : '#cbd5e1');
        barPartyNames.push(winnerParty ? winnerParty.nombre : 'Sin datos');
    });

    // Actualizar Gráficos con datos de tendencia
    updateCharts(partidos, votosTotalesHaciaPartido, {
        labels: labelsBar,
        values: barValues,
        colors: barColors,
        names: barPartyNames
    });

    // Actualizar Tabla de Resultados
    if (tablaRes) {
        tablaRes.innerHTML = '';
        const partidosOrdenados = [...partidos].sort((a, b) => (votosTotalesHaciaPartido[b.id] || 0) - (votosTotalesHaciaPartido[a.id] || 0));
        partidosOrdenados.forEach(p => {
            const tr = document.createElement('tr');
            const votos = votosTotalesHaciaPartido[p.id] || 0;
            const porcentaje = granTotalVotos > 0 ? ((votos / granTotalVotos) * 100).toFixed(2) : 0;
            tr.innerHTML = `
                <td><div style="display: flex; align-items: center; gap: 0.5rem; font-weight: 600;"><span style="width: 12px; height: 12px; border-radius: 50%; background-color: ${p.color};"></span>${p.nombre}</div></td>
                <td>${p.sigla}</td>
                <td style="font-weight: 700;">${votos.toLocaleString()}</td>
                <td>${porcentaje}%</td>
            `;
            tablaRes.appendChild(tr);
        });
    }

    await renderActasList();
}

async function renderActasList() {
    const listBody = document.getElementById('tabla-actas-list');
    const dSelect = document.getElementById('filter-distrito-dash');
    const cSelect = document.getElementById('filter-centro-dash');

    if (!listBody) return; // Solo en index.html

    const selDistrito = dSelect?.value || null;
    const selCentro = cSelect?.value || null;

    // Obtener actas con filtros aplicados
    let query = supabaseClient
        .from('actas')
        .select('*')
        .order('fecha', { ascending: false });

    if (selDistrito) query = query.eq('municipio', selDistrito);
    if (selCentro) query = query.eq('centro_votacion', selCentro);

    const { data: actas, error } = await query;

    if (error || !actas) {
        listBody.innerHTML = `<tr><td colspan="5" style="text-align: center;">Error al cargar actas.</td></tr>`;
        return;
    }

    listBody.innerHTML = '';

    if (actas.length === 0) {
        listBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No hay actas procesadas en este criterio.</td></tr>`;
        return;
    }

    actas.forEach(acta => {
        const tr = document.createElement('tr');
        const dateStr = new Date(acta.fecha).toLocaleString('es-SV', { dateStyle: 'short', timeStyle: 'short' });

        tr.innerHTML = `
            <td style="color: var(--text-muted); font-size: 0.85rem;">${dateStr}</td>
            <td style="font-weight: 700; color: var(--text-main);">${acta.centro_votacion}</td>
            <td style="font-weight: 600; color: var(--sv-blue);">${acta.municipio}</td>
            <td><span class="badge-jrv">JRV ${acta.jrv}</span></td>
            <td>
                <button onclick="exportActaPDF('${acta.id}', ${acta.jrv})" class="btn-download-acta">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    PDF
                </button>
            </td>
        `;
        listBody.appendChild(tr);
    });
}

// ==========================================
// LÓGICA DE EXPORTACIÓN A PDF (jsPDF)
// ==========================================
window.exportGlobalPDF = function () {
    if (!window.jspdf) return alert('La librería PDF no ha cargado aún.');
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // 1. OBTENER ESTADO ACTUAL DE FILTROS
    const dSelect = document.getElementById('filter-distrito-dash');
    const cSelect = document.getElementById('filter-centro-dash');
    const selDistrito = dSelect?.value || "Todo el Municipio";
    const selCentro = cSelect?.value || "Todos los Centros";

    // 2. DISEÑO DE ENCABEZADO PREMIUM
    doc.setFillColor(15, 71, 175); // Azul TSE
    doc.rect(0, 0, 210, 45, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("USULUTÁN NORTE - ESCRUTINIO 2024", 14, 25);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Sistema Oficial de Procesamiento de Actas Electorales", 14, 33);
    doc.text(`Reporte generado por: Conteo de Votos SV`, 14, 38);

    // 3. CONTEXTO DEL REPORTE (Filtros y Fecha)
    doc.setTextColor(30, 41, 59); // Slate 800
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("DATOS DEL REPORTE:", 14, 60);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Ámbito: Distritos de Usulután Norte`, 14, 68);
    doc.text(`Filtro Distrito: ${selDistrito}`, 14, 74);
    doc.text(`Filtro Centro: ${selCentro}`, 14, 80);
    doc.text(`Fecha/Hora: ${new Date().toLocaleString('es-SV')}`, 140, 68);

    // 4. BLOQUE DE MÉTRICAS (KPIs)
    const totalVotos = document.getElementById('stat-total-votos').textContent;
    const totalActas = document.getElementById('stat-actas').textContent;
    const participacion = document.getElementById('stat-participacion').textContent;

    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 88, 182, 25, 3, 3, 'FD');

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("VOTOS TOTALES", 25, 96);
    doc.text("ACTAS PROCESADAS", 80, 96);
    doc.text("PARTICIPACIÓN", 145, 96);

    doc.setFontSize(14);
    doc.setTextColor(15, 71, 175);
    doc.text(totalVotos, 25, 105);
    doc.text(totalActas, 80, 105);
    doc.text(participacion, 145, 105);

    // 5. CAPTURAR GRÁFICOS (Dona y Barras)
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("VISUALIZACIÓN DE RESULTADOS", 14, 125);

    try {
        const pieCanvas = document.getElementById('pieChart');
        const barCanvas = document.getElementById('barChart');

        if (pieCanvas) {
            const pieImg = pieCanvas.toDataURL('image/png', 1.0);
            doc.addImage(pieImg, 'PNG', 14, 130, 85, 60);
        }

        if (barCanvas) {
            const barImg = barCanvas.toDataURL('image/png', 1.0);
            doc.addImage(barImg, 'PNG', 105, 130, 95, 60);
        }
    } catch (e) {
        console.error("Error en gráficos PDF:", e);
    }

    // 6. TABLA DE RESULTADOS POR PARTIDO
    doc.text("DETALLE POR PARTIDO POLÍTICO", 14, 205);

    const tableBody = [];
    document.querySelectorAll('#tabla-resultados tr').forEach(tr => {
        const cells = tr.querySelectorAll('td');
        if (cells.length >= 4) {
            tableBody.push([
                cells[0].textContent.trim(), // Nombre
                cells[1].textContent.trim(), // Sigla
                cells[2].textContent.trim(), // Votos
                cells[3].textContent.trim()  // %
            ]);
        }
    });

    doc.autoTable({
        startY: 210,
        head: [['Partido Político', 'Sigla', 'Votos Totales', 'Porcentaje']],
        body: tableBody,
        theme: 'striped',
        headStyles: { fillColor: [15, 71, 175], fontSize: 10, halign: 'center' },
        columnStyles: {
            2: { halign: 'right', fontStyle: 'bold' },
            3: { halign: 'right' }
        },
        styles: { fontSize: 9, cellPadding: 4 }
    });

    // Pie de página
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(`Documento de carácter oficial - Página ${i} de ${pageCount}`, 14, 285);
        doc.text("TSE Usulután Norte | Escrutinio 2024", 150, 285);
    }

    const fileName = `Reporte_${selDistrito.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`;
    doc.save(fileName);
}

window.exportActaPDF = async function (actaId, jrvNum) {
    if (!window.jspdf) return alert('La librería PDF no ha cargado aún.');
    const { jsPDF } = window.jspdf;

    // Obtener info del acta
    const { data: acta } = await supabaseClient.from('actas').select('*').eq('id', actaId).single();
    if (!acta) return alert("Error leyendo el acta");

    // Obtener votos
    const { data: votos } = await supabaseClient
        .from('votos')
        .select('cantidad, partidos(nombre, sigla)')
        .eq('acta_id', actaId);

    const doc = new jsPDF();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(`Acta de Cierre y Escrutinio - JRV ${jrvNum}`, 14, 22);

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Centro de Votación: ${acta.centro_votacion}`, 14, 32);
    doc.text(`Zona (Municipio): ${acta.zona}`, 14, 38);
    doc.text(`Distrito: ${acta.municipio}`, 14, 44);
    doc.text(`Departamento: ${acta.departamento}`, 14, 50);
    doc.text(`Fecha de Procesamiento: ${new Date(acta.fecha).toLocaleString('es-SV')}`, 14, 56);

    const tableData = (votos || []).map(v => [v.partidos?.nombre || 'N/A', v.partidos?.sigla || 'N/A', v.cantidad]);

    doc.autoTable({
        startY: 65,
        head: [['Partido Político', 'Sigla', 'Votos Válidos']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [15, 71, 175] }
    });

    doc.save(`acta_JRV_${jrvNum}.pdf`);
}

function setupRealtimeSubscription(partidos) {
    // Optimización: Debounce para evitar ráfagas de renders
    const debouncedRender = debounce(() => renderDashboardData(partidos), 1000);

    supabaseClient.channel('dashboard-updates')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'votos' }, payload => {
            console.log("Cambio detectado en Votos, actualizando Dashboard...");
            debouncedRender();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'actas' }, payload => {
            console.log("Cambio detectado en Actas, actualizando Dashboard...");
            debouncedRender();
        })
        .subscribe();
}

// ==========================================
// LÓGICA DE LOGIN (login.html)
// ==========================================
async function initLogin() {
    console.log("Iniciando vista de Login...");
    // Redirigir si ya está logueado
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) {
        window.location.href = 'admin.html';
        return;
    }

    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const btn = loginForm.querySelector('button[type="submit"]');

        btn.disabled = true;
        btn.textContent = 'Verificando...';

        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email, password
        });

        if (error) {
            showAlert('login-alert', 'Credenciales incorrectas.', 'error');
            btn.disabled = false;
            btn.textContent = 'Ingresar al Panel';
        } else {
            // VERIFICACIÓN ADICIONAL: ¿Tiene perfil activo?
            const { data: perfil } = await supabaseClient.from('perfiles').select('rol').eq('id', data.user.id).single();

            if (!perfil) {
                await supabaseClient.auth.signOut();
                showAlert('login-alert', 'Acceso denegado: Su cuenta ha sido desactivada.', 'error');
                btn.disabled = false;
                btn.textContent = 'Ingresar al Panel';
                return;
            }

            await logAuditoria('LOGIN', 'auth', { email });
            window.location.href = 'admin.html';
        }
    });
}

// ==========================================
// LÓGICA DE PANEL ADMIN (admin.html)
// ==========================================
async function initAdmin() {
    console.log("Iniciando vista de Admin Usulután Norte...");

    // Verificar autenticación
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) {
        window.location.href = 'login.html';
        return;
    }

    // Verificar PERFIL activo
    const { data: perfil } = await supabaseClient.from('perfiles').select('rol').eq('id', session.user.id).single();
    if (!perfil) {
        await supabaseClient.auth.signOut();
        window.location.href = 'login.html?error=unauthorized';
        return;
    }

    document.getElementById('admin-body').style.display = 'block';
    document.getElementById('user-email').textContent = session.user.email;

    // Botón Logout
    document.getElementById('btn-logout').addEventListener('click', async () => {
        await supabaseClient.auth.signOut();
        window.location.href = 'index.html';
    });

    // El botón de Super Admin solo será visible para admin@gob.sv
    if (session.user.email === 'admin@gob.sv') {
        const navLinks = document.querySelector('.nav-links');
        if (!document.getElementById('btn-superadmin')) {
            const saBtn = document.createElement('a');
            saBtn.id = 'btn-superadmin';
            saBtn.href = 'superadmin.html';
            saBtn.className = 'btn';
            saBtn.style.cssText = 'padding: 0.5rem 1rem; background: #FEF2F2; color: #EF4444; border: 1px solid #FECACA; text-decoration: none; margin-right: 1rem; font-weight: bold;';
            saBtn.innerHTML = 'Zona Super Admin';
            navLinks.insertBefore(saBtn, document.getElementById('user-email'));
        }
    }

    // Lógica Geográfica Admin
    const munSelect = document.getElementById('municipio'); // Distrito
    const centroSelect = document.getElementById('centro_votacion');

    if (munSelect && centroSelect) {
        munSelect.addEventListener('change', (e) => {
            const distrito = e.target.value;
            centroSelect.innerHTML = '<option value="">Seleccione Centro de Votación</option>';

            if (distrito && ESTRUCTURA_GEOGRAFICA_SV["Usulután"]["Usulután Norte"][distrito]) {
                const centros = ESTRUCTURA_GEOGRAFICA_SV["Usulután"]["Usulután Norte"][distrito];
                centros.forEach(c => {
                    const opt = document.createElement('option');
                    opt.value = c;
                    opt.textContent = c;
                    centroSelect.appendChild(opt);
                });
                centroSelect.disabled = false;
            } else {
                centroSelect.disabled = true;
            }
        });
    }

    // Cargar Partidos
    const partidos = await loadPartidos();
    const container = document.getElementById('partidos-votos-container');
    if (container) {
        container.innerHTML = '';
        partidos.forEach(p => {
            const div = document.createElement('div');
            div.className = 'form-group card';
            div.style.marginBottom = '0';
            div.style.boxShadow = 'none';
            div.innerHTML = `
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                    <span style="width: 12px; height: 12px; border-radius: 50%; background-color: ${p.color};"></span>
                    <label for="voto_${p.id}" class="form-label" style="margin-bottom: 0;">${p.sigla} - ${p.nombre}</label>
                </div>
                <input type="number" id="voto_${p.id}" data-partido-id="${p.id}" class="form-control" value="0" min="0" required>
            `;
            container.appendChild(div);
        });
    }

    // Guardar Acta
    const form = document.getElementById('acta-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.textContent = 'Guardando datos...';

        try {
            const actaData = {
                centro_votacion: document.getElementById('centro_votacion').value,
                jrv: parseInt(document.getElementById('jrv').value),
                departamento: "Usulután",
                zona: "Usulután Norte",
                municipio: document.getElementById('municipio').value,
                user_id: session.user.id
            };

            let nuevaActaId = null;
            if (editModeId) {
                const { error: updateError } = await supabaseClient.from('actas').update(actaData).eq('id', editModeId);
                if (updateError) throw updateError;
                nuevaActaId = editModeId;
            } else {
                const { data: nuevaActa, error: actaError } = await supabaseClient.from('actas').insert([actaData]).select('id').single();
                if (actaError) throw actaError;
                nuevaActaId = nuevaActa.id;
            }

            const votosToUpsert = partidos.map(p => ({
                acta_id: nuevaActaId,
                partido_id: p.id,
                cantidad: parseInt(document.getElementById(`voto_${p.id}`).value) || 0
            }));

            const { error: votosError } = await supabaseClient.from('votos').upsert(votosToUpsert, { onConflict: 'acta_id, partido_id' });
            if (votosError) throw votosError;

            showAlert('admin-alert', 'Acta guardada correctamente.', 'success');
            await logAuditoria(editModeId ? 'UPDATE' : 'INSERT', 'actas', { jrv: actaData.jrv, id: nuevaActaId });
            cancelEdit();
            loadUserActas();
        } catch (error) {
            console.error("Error detectado:", error);
            showAlert('admin-alert', 'Error: ' + error.message, 'error');
        } finally {
            btn.disabled = false;
            btn.textContent = 'Transmitir Acta al Sistema Central';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    await loadUserActas();
}

// ==========================================
// FUNCIONES DE GESTIÓN INDIVIDUAL (CRUD)
// ==========================================
async function loadUserActas() {
    const listBody = document.getElementById('user-actas-list');
    const txtTotal = document.getElementById('txt-total-registros');
    if (!listBody) return;

    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) return;

    const { data: actas, error } = await supabaseClient
        .from('actas')
        .select('*')
        .eq('user_id', session.user.id)
        .order('fecha', { ascending: false });

    if (error) {
        console.error("Error cargando actas del usuario:", error);
        listBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: red;">Error al cargar sus registros.</td></tr>`;
        return;
    }

    if (txtTotal) txtTotal.textContent = `${actas.length} registro(s) encontrado(s)`;

    if (actas.length === 0) {
        listBody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">Usted aún no ha ingresado actas en este sistema.</td></tr>`;
        return;
    }

    listBody.innerHTML = '';
    actas.forEach(acta => {
        const tr = document.createElement('tr');
        const dateStr = new Date(acta.fecha).toLocaleString('es-SV', { dateStyle: 'short', timeStyle: 'short' });

        tr.innerHTML = `
            <td style="font-weight: 700; color: var(--sv-blue);">#${acta.jrv}</td>
            <td>${acta.centro_votacion}</td>
            <td style="font-size: 0.85rem; color: var(--text-muted);">${acta.municipio}, ${acta.departamento}</td>
            <td style="font-size: 0.85rem;">${dateStr}</td>
            <td style="text-align: right;">
                <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
                    <button onclick="editActa('${acta.id}')" class="btn" style="padding: 0.4rem 0.6rem; background: #E0F2FE; color: #0369A1; border: none; font-size: 0.75rem; font-weight: 600;">Editar</button>
                    <button onclick="deleteActa('${acta.id}', ${acta.jrv})" class="btn" style="padding: 0.4rem 0.6rem; background: #FEE2E2; color: #B91C1C; border: none; font-size: 0.75rem; font-weight: 600;">Borrar</button>
                </div>
            </td>
        `;
        listBody.appendChild(tr);
    });
}

window.deleteActa = async function (id, jrv) {
    if (!confirm(`¿Está seguro que desea eliminar el registro de la JRV ${jrv}? Esta acción no se puede deshacer.`)) return;

    const { error } = await supabaseClient.from('actas').delete().eq('id', id);

    if (error) {
        showAlert('admin-alert', 'Error al eliminar el acta: ' + error.message, 'error');
    } else {
        await logAuditoria('DELETE', 'actas', { id, jrv });
        showAlert('admin-alert', 'Acta eliminada correctamente.', 'success');
        loadUserActas();
    }
}

window.editActa = async function (id) {
    editModeId = id;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Cambiar visual del botón y título
    const btn = document.querySelector('#acta-form button[type="submit"]');
    btn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        Actualizar Datos JRV
    `;
    btn.style.background = '#059669'; // Verde esmeralda para edición

    // Agregar botón cancelar
    if (!document.getElementById('btn-cancel-edit')) {
        const cancelBtn = document.createElement('button');
        cancelBtn.id = 'btn-cancel-edit';
        cancelBtn.type = 'button';
        cancelBtn.className = 'btn btn-block';
        cancelBtn.style.marginTop = '0.5rem';
        cancelBtn.style.background = '#94A3B8';
        cancelBtn.textContent = 'Cancelar Edición';
        cancelBtn.onclick = cancelEdit;
        btn.parentNode.appendChild(cancelBtn);
    }

    showAlert('admin-alert', 'Modo Edición Activado: Cargando datos...', 'info');

    // Cargar datos del acta
    const { data: acta } = await supabaseClient.from('actas').select('*').eq('id', id).single();
    if (!acta) return showAlert('admin-alert', 'No se pudo cargar el acta.', 'error');

    // Poblar campos base
    document.getElementById('jrv').value = acta.jrv;

    // Forzar triggers de selects geográficos
    const munSelect = document.getElementById('municipio');
    const centroSelect = document.getElementById('centro_votacion');

    if (munSelect) {
        munSelect.value = acta.municipio;
        // Disparar evento para cargar centros
        munSelect.dispatchEvent(new Event('change'));

        // Esperar un momento a que se pueblen los centros para seleccionar el correcto
        setTimeout(() => {
            if (centroSelect) {
                centroSelect.value = acta.centro_votacion;
            }
        }, 100);
    }

    // Cargar votos
    const { data: votos } = await supabaseClient.from('votos').select('partido_id, cantidad').eq('acta_id', id);
    if (votos) {
        votos.forEach(v => {
            const input = document.getElementById(`voto_${v.partido_id}`);
            if (input) input.value = v.cantidad;
        });
    }
}

function cancelEdit() {
    editModeId = null;
    const form = document.getElementById('acta-form');
    form.reset();

    // Resetear visual del botón
    const btn = form.querySelector('button[type="submit"]');
    btn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
            <polyline points="17 21 17 13 7 13 7 21"></polyline>
            <polyline points="7 3 7 8 15 8"></polyline>
        </svg>
        Transmitir Acta al Sistema Central
    `;
    btn.style.background = ''; // Volver al color por defecto (sv-blue)

    // Quitar botón cancelar
    const cancelBtn = document.getElementById('btn-cancel-edit');
    if (cancelBtn) cancelBtn.remove();

    // Resetear selects dependientes
    const munSelect = document.getElementById('municipio');
    const centroSelect = document.getElementById('centro_votacion');
    if (munSelect) munSelect.value = "";
    if (centroSelect) {
        centroSelect.innerHTML = '<option value="">Seleccione Distrito primero</option>';
        centroSelect.disabled = true;
    }

    // Resetear votos a 0
    document.querySelectorAll('#partidos-votos-container input').forEach(inp => inp.value = "0");
}

// ==========================================
// LÓGICA DE SUPER ADMIN (superadmin.html)
// ==========================================
async function initSuperAdmin() {
    console.log("Iniciando vista de SUPER Admin...");

    // Verificar sesión y correo maestro
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session || session.user.email !== 'admin@gob.sv') {
        alert("Acceso Denegado. Solo el correo principal (admin@gob.sv) tiene nivel de Super Administrador.");
        window.location.href = 'admin.html';
        return;
    }

    // Autorizado
    document.getElementById('superadmin-body').style.display = 'block';
    document.getElementById('user-email').textContent = session.user.email;

    document.getElementById('btn-logout').addEventListener('click', async () => {
        await supabaseClient.auth.signOut();
        window.location.href = 'index.html';
    });

    // LÓGICA VACIAR DATOS
    const nukeInput = document.getElementById('confirm-delete-text');
    const nukeBtn = document.getElementById('btn-nuke-db');

    nukeInput.addEventListener('input', (e) => {
        if (e.target.value === 'VACIAR DATOS') {
            nukeBtn.style.pointerEvents = 'auto';
            nukeBtn.style.opacity = '1';
        } else {
            nukeBtn.style.pointerEvents = 'none';
            nukeBtn.style.opacity = '0.5';
        }
    });

    nukeBtn.addEventListener('click', async () => {
        if (!confirm("¿ESTÁS COMPLETAMENTE SEGURO? Se borrarán TODAS las actas y TODOS los votos.")) return;

        nukeBtn.disabled = true;
        nukeBtn.textContent = 'Borrando Base de Datos...';

        // Debido a ON DELETE CASCADE en supabase_setup, borrar actas borra los votos
        const { error } = await supabaseClient.from('actas').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Tricky delete all

        if (error) {
            console.error(error);
            showAlert('superadmin-alert', 'Error al vaciar datos: ' + error.message, 'error');
        } else {
            showAlert('superadmin-alert', 'Base de datos vaciada con éxito. Sistema en Ceros.', 'success');
            setTimeout(() => location.reload(), 2000);
        }

        nukeBtn.disabled = false;
        nukeBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 0.5rem;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg> Ejecutar Borrado Absoluto';
        nukeInput.value = '';
    });

    // LÓGICA CREAR USUARIOS
    const createForm = document.getElementById('create-user-form');
    createForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newEmail = document.getElementById('new-user-email').value;
        const newPassword = document.getElementById('new-user-password').value;
        const btn = createForm.querySelector('button[type="submit"]');

        btn.disabled = true;
        btn.textContent = 'Creando usuario...';

        try {
            // Guardamos la sesión actual del Super Admin temporalmente
            const { data: { session: currentSession } } = await supabaseClient.auth.getSession();

            // Creamos el usuario nuevo. Por defecto Supabase lo logueará.
            const { data, error } = await supabaseClient.auth.signUp({
                email: newEmail,
                password: newPassword
            });

            if (error) throw error;

            // Restauramos la sesión del Super Admin original para no sacarlo de la pantalla
            if (currentSession) {
                await supabaseClient.auth.setSession({
                    access_token: currentSession.access_token,
                    refresh_token: currentSession.refresh_token
                });
            }

            showAlert('superadmin-alert', `Digitador '${newEmail}' creado exitosamente.`, 'success');
            createForm.reset();
            loadUsers(); // Recargar lista
        } catch (err) {
            console.error(err);
            showAlert('superadmin-alert', 'Error creando usuario: ' + err.message, 'error');
        } finally {
            btn.disabled = false;
            btn.textContent = 'Registrar Auxiliar';
        }
    });

    // Cargar Datos Iniciales
    loadUsers();
    loadAuditoria();
}

// GESTIÓN DE USUARIOS
async function loadUsers() {
    const list = document.getElementById('tabla-usuarios-list');
    if (!list) return;

    const { data: perfiles, error } = await supabaseClient.from('perfiles').select('*').order('created_at', { ascending: false });

    if (error) return console.error(error);

    list.innerHTML = '';
    perfiles.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${p.email}</td>
            <td><span class="badge-jrv" style="background: ${p.rol === 'superadmin' ? '#EF4444' : '#10B981'}">${p.rol.toUpperCase()}</span></td>
            <td style="font-size: 0.8rem;">${new Date(p.created_at).toLocaleString()}</td>
            <td>
                <button onclick="deleteUserProfile('${p.id}', '${p.email}')" class="btn btn-danger" style="padding: 0.3rem 0.6rem; font-size: 0.7rem;">Eliminar</button>
            </td>
        `;
        list.appendChild(tr);
    });
}

window.deleteUserProfile = async function (id, email) {
    if (email === 'admin@gob.sv') return alert("No se puede eliminar al administrador principal.");
    if (!confirm(`¿Seguro que desea eliminar el perfil de ${email}? El usuario perderá acceso al sistema.`)) return;

    const { error } = await supabaseClient.from('perfiles').delete().eq('id', id);
    if (error) {
        showAlert('superadmin-alert', 'Error al eliminar perfil: ' + error.message, 'error');
    } else {
        await logAuditoria('DELETE_USER', 'perfiles', { target_email: email });
        showAlert('superadmin-alert', 'Perfil eliminado correctamente.', 'success');
        loadUsers();
    }
}

// GESTIÓN DE AUDITORÍA
window.loadAuditoria = async function () {
    const list = document.getElementById('tabla-auditoria-list');
    if (!list) return;

    list.innerHTML = '<tr><td colspan="6" style="text-align:center;">Cargando registros...</td></tr>';

    const { data, error } = await supabaseClient.from('auditoria').select('*').order('created_at', { ascending: false }).limit(100);

    if (error) {
        console.error(error);
        list.innerHTML = '<tr><td colspan="6" style="text-align:center; color:red;">Error al cargar auditoría.</td></tr>';
        return;
    }

    list.innerHTML = '';
    data.forEach(log => {
        const tr = document.createElement('tr');
        // Usamos un botón para ver el JSON para no romper la tabla
        const detallesStr = JSON.stringify(log.detalles);
        tr.innerHTML = `
            <td style="font-size: 0.75rem;">${new Date(log.created_at).toLocaleString()}</td>
            <td style="font-weight: 600;">${log.operador}</td>
            <td><span class="badge-jrv" style="background: #F59E0B">${log.evento}</span></td>
            <td>${log.tabla}</td>
            <td style="font-family: monospace; font-size: 0.8rem;">${log.ip_address}</td>
            <td style="text-align: center;">
                <button onclick='alert("Detalles Tecnicos:\\n" + JSON.stringify(${detallesStr}, null, 2))' class="btn" style="padding: 0.2rem 0.5rem; font-size: 0.7rem; background: #F1F5F9; color: var(--text-main);">Ver JSON</button>
            </td>
        `;
        list.appendChild(tr);
    });
}
