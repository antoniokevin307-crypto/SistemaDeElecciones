// ==========================================
// ESTADO GLOBAL
// ==========================================
let globalPartidos = [];
let TOTAL_ELECTORES_ESTIMADO = 5400000; // Constante para la participación

const ESTRUCTURA_GEOGRAFICA_SV = {
    "Ahuachapán": {
        "Ahuachapán Norte": ["Atiquizaya", "El Refugio", "San Lorenzo", "Turín"],
        "Ahuachapán Centro": ["Ahuachapán", "Apaneca", "Concepción de Ataco", "Tacuba"],
        "Ahuachapán Sur": ["Guaymango", "Jujutla", "San Francisco Menéndez", "San Pedro Puxtla"]
    },
    "Santa Ana": {
        "Santa Ana Norte": ["Masahuat", "Metapán", "Santa Rosa Guachipilín", "Texistepeque"],
        "Santa Ana Centro": ["Santa Ana"],
        "Santa Ana Este": ["Coatepeque", "El Congo"],
        "Santa Ana Oeste": ["Candelaria de la Frontera", "Chalchuapa", "El Porvenir", "San Antonio Pajonal", "San Sebastián Salitrillo", "Santiago de la Frontera"]
    },
    "Sonsonate": {
        "Sonsonate Norte": ["Juayúa", "Nahuizalco", "Salcoatitán", "Santa Catarina Masahuat"],
        "Sonsonate Centro": ["Nahulingo", "San Antonio del Monte", "San Julián", "Santa Isabel Ishuatán", "Sonsonate", "Sonzacate", "Santo Domingo de Guzmán"],
        "Sonsonate Este": ["Armenia", "Caluco", "Izalco"],
        "Sonsonate Oeste": ["Acajutla"]
    },
    "Chalatenango": {
        "Chalatenango Norte": ["La Palma", "Citalá", "San Ignacio"],
        "Chalatenango Centro": ["Agua Caliente", "Chalatenango", "Dulce Nombre de María", "El Paraíso", "La Laguna", "La Reina", "Nueva Concepción", "San Fernando", "San Francisco Morazán", "San Rafael", "Santa Rita"],
        "Chalatenango Sur": ["Azacualpa", "Arcatao", "Comalapa", "Concepción Quezaltepeque", "El Carrizal", "La Unión", "Nombre de Jesús", "Nueva Trinidad", "Ojos de Agua", "Potonico", "San Antonio de la Cruz", "San Antonio Los Ranchos", "San Isidro Labrador", "San José Cancasque", "San Miguel de Mercedes", "San José Las Flores", "San Luis del Carmen", "San Francisco Lempa", "San Juan Buenavista", "San Sebastián"]
    },
    "La Libertad": {
        "La Libertad Norte": ["Quezaltepeque", "San Matías", "San Pablo Tacachico"],
        "La Libertad Centro": ["Colón", "Jayaque", "Sacacoyo", "Talnique", "Tepecoyo"],
        "La Libertad Este": ["Antiguo Cuscatlán", "Huizúcar", "Nuevo Cuscatlán", "San José Villanueva", "Zaragoza"],
        "La Libertad Oeste": ["Ciudad Arce", "San Juan Opico"],
        "La Libertad Costa": ["Chiltiupán", "Jicalapa", "La Libertad", "Tamanique", "Teotepeque"],
        "La Libertad Sur": ["Comasagua", "Santa Tecla"]
    },
    "San Salvador": {
        "San Salvador Norte": ["Aguilares", "El Paisnal", "Guazapa"],
        "San Salvador Oeste": ["Apopa", "Nejapa"],
        "San Salvador Este": ["Ilopango", "San Martín", "Soyapango", "Tonacatepeque"],
        "San Salvador Centro": ["Ayutuxtepeque", "Cuscatancingo", "Ciudad Delgado", "Mejicanos", "San Salvador"],
        "San Salvador Sur": ["Panchimalco", "Rosario de Mora", "San Marcos", "Santo Tomás", "Santiago Texacuangos"]
    },
    "Cuscatlán": {
        "Cuscatlán Norte": ["Suchitoto", "San José Guayabal", "Oratorio de Concepción", "San Bartolomé Perulapía", "San Pedro Perulapán"],
        "Cuscatlán Sur": ["Cojutepeque", "San Rafael Cedros", "Candelaria", "Monte San Juan", "El Carmen", "San Cristóbal", "Santa Cruz Michapa", "San Ramón", "El Rosario", "Santa Cruz Analquito", "Tenancingo"]
    },
    "La Paz": {
        "La Paz Centro": ["Jerusalén", "Mercedes La Ceiba", "Olocuilta", "Paraíso de Osorio", "San Antonio Masahuat", "San Emigdio", "San Juan Talpa", "San Juan Tepezontes", "San Luis Talpa", "San Miguel Tepezontes", "San Pedro Masahuat", "Santiago Nonualco", "Tapalhuaca", "Cuyultitán", "San Francisco Chinameca"],
        "La Paz Este": ["San Luis La Herradura", "Zacatecoluca"],
        "La Paz Oeste": ["San Juan Nonualco", "San Rafael Obrajuelo", "Santa María Ostuma"]
    },
    "Cabañas": {
        "Cabañas Este": ["Dolores", "Guacotecti", "San Isidro", "Sensuntepeque", "Victoria"],
        "Cabañas Oeste": ["Cinquera", "Ilobasco", "Jutiapa", "Tejutepeque"]
    },
    "San Vicente": {
        "San Vicente Norte": ["Apastepeque", "San Ildefonso", "San Esteban Catarina", "San Lorenzo", "San Sebastián", "Santa Clara", "Santo Domingo"],
        "San Vicente Sur": ["Guadalupe", "San Cayetano Istepeque", "San Vicente", "Tecoluca", "Verapaz", "Tepetitán"]
    },
    "Usulután": {
        "Usulután Norte": ["Alegría", "Berlín", "Mercedes Umaña", "Jucuapa", "El Triunfo", "Estanzuelas", "San Buenaventura", "Santiago de María", "Nueva Granada"],
        "Usulután Este": ["Santa María", "Ozatlán", "Tecapán", "Santa Elena", "California", "Ereguayquín", "Jucuarán", "Concepción Batres", "San Dionisio", "Usulután"],
        "Usulután Oeste": ["Jiquilisco", "Puerto El Triunfo", "San Agustín", "San Francisco Javier"]
    },
    "San Miguel": {
        "San Miguel Norte": ["Ciudad Barrios", "Sesori", "San Luis de la Reina", "Nuevo Edén de San Juan", "Carolina", "San Antonio del Mosco", "Chapeltique", "San Gerardo"],
        "San Miguel Centro": ["Comacarán", "Moncagua", "Quelepa", "San Miguel", "Uluazapa"],
        "San Miguel Oeste": ["Chinameca", "Chirilagua", "Lolotique", "Nueva Guadalupe", "San Jorge", "San Rafael Oriente", "El Tránsito"]
    },
    "Morazán": {
        "Morazán Norte": ["Arambala", "Cacaopera", "Corinto", "El Divisadero", "Gualococti", "Guatajiagua", "Joateca", "Jocoaitique", "Meanguera", "Perquín", "San Fernando", "San Isidro", "San Simón", "Torola"],
        "Morazán Sur": ["Cacaopera", "Chilanga", "Delicias de Concepción", "El Divisadero", "El Rosario", "Gualococti", "Guatajiagua", "Joateca", "Jocoaitique", "Lolotiquillo", "Meanguera", "Osicala", "Perquín", "San Carlos", "San Fernando", "San Francisco Gotera", "San Isidro", "San Simón", "Sensembra", "Sociedad", "Torola", "Yamabal", "Yoloaiquín"]
    },
    "La Unión": {
        "La Unión Norte": ["Anamorós", "Bolívar", "Concepción de Oriente", "El Sauce", "Lislique", "Nueva Esparta", "Pasaquina", "Polorós", "San José La Fuente", "Santa Rosa de Lima"],
        "La Unión Sur": ["Conchagua", "El Carmen", "Intipucá", "La Unión", "Meanguera del Golfo", "San Alejo", "Yayantique", "Yucuaiquín"]
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
    const { data, error } = await supabaseClient.from('partidos').select('*').order('created_at', { ascending: true });
    if (error) {
        console.error("Error cargando partidos:", error);
        return [];
    }
    globalPartidos = data || [];
    return globalPartidos;
}

// ==========================================
// LÓGICA DEL DASHBOARD PÚBLICO (index.html)
// ==========================================
async function initDashboard() {
    console.log("Iniciando Dashboard Público...");
    initCharts(); // from charts.js
    const partidos = await loadPartidos();

    // Lógica de Acceso Oculto (Easter Egg)
    let clickCount = 0;
    const logo = document.getElementById('nav-brand-logo');
    if (logo) {
        logo.addEventListener('click', (e) => {
            e.preventDefault();
            clickCount++;
            if (clickCount >= 5) {
                window.location.href = 'login.html';
            }
            // Reset counter after 3 seconds of inactivity
            setTimeout(() => { clickCount = 0; }, 3000);
        });
    }

    // Configurar Realtime Subscription antes de cargar inicialmente
    setupRealtimeSubscription(partidos);

    // Carga inicial de datos
    await renderDashboardData(partidos);
}

async function renderDashboardData(partidos) {
    const tablaRes = document.getElementById('tabla-resultados');

    // 1. Obtener total de actas procesadas
    const { count: countActas, error: errActas } = await supabaseClient
        .from('actas')
        .select('*', { count: 'exact', head: true });

    // 2. Obtener sumatoria de votos
    const { data: votosData, error: errVotos } = await supabaseClient
        .from('votos')
        .select('partido_id, cantidad');

    if (errVotos || errActas) {
        console.error("Error obteniendo datos electorales:", errVotos || errActas);
        if (tablaRes) {
            tablaRes.innerHTML = `<tr><td colspan="4" style="text-align: center; color: red;">Error al cargar datos. Verifica que ejecutaste el script SQL en Supabase y que las tablas existen.</td></tr>`;
        }
        return;
    }

    if (!partidos || partidos.length === 0) {
        if (tablaRes) {
            tablaRes.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">No hay partidos registrados aún. Asegúrate de correr el script SQL completo.</td></tr>`;
        }
        return;
    }

    // Calcular Votos por partido y total absoluto
    let votosTotalesHaciaPartido = {};
    let granTotalVotos = 0;

    partidos.forEach(p => { votosTotalesHaciaPartido[p.id] = 0; });

    (votosData || []).forEach(voto => {
        if (voto.cantidad > 0) {
            votosTotalesHaciaPartido[voto.partido_id] = (votosTotalesHaciaPartido[voto.partido_id] || 0) + voto.cantidad;
            granTotalVotos += voto.cantidad;
        }
    });

    // Actualizar KPIs
    document.getElementById('stat-total-votos').textContent = granTotalVotos.toLocaleString();
    document.getElementById('stat-actas').textContent = countActas ? countActas.toLocaleString() : '0';

    let participacion = granTotalVotos > 0 ? ((granTotalVotos / TOTAL_ELECTORES_ESTIMADO) * 100).toFixed(2) : 0;
    document.getElementById('stat-participacion').textContent = participacion + '%';
    document.getElementById('progress-participacion').style.width = participacion + '%';

    // Actualizar Gráficos
    updateCharts(partidos, votosTotalesHaciaPartido);

    // Actualizar Tabla de Resultados (Ordenados de mayor a menor)
    if (tablaRes) tablaRes.innerHTML = '';

    const partidosOrdenados = [...partidos].sort((a, b) => (votosTotalesHaciaPartido[b.id] || 0) - (votosTotalesHaciaPartido[a.id] || 0));

    partidosOrdenados.forEach(p => {
        const tr = document.createElement('tr');
        const votos = votosTotalesHaciaPartido[p.id] || 0;
        const porcentaje = granTotalVotos > 0 ? ((votos / granTotalVotos) * 100).toFixed(2) : 0;

        tr.innerHTML = `
            <td>
                <div style="display: flex; align-items: center; gap: 0.5rem; font-weight: 600;">
                    <span style="width: 12px; height: 12px; border-radius: 50%; background-color: ${p.color}; display: inline-block;"></span>
                    ${p.nombre}
                </div>
            </td>
            <td>${p.sigla}</td>
            <td style="font-weight: 700;">${votos.toLocaleString()}</td>
            <td>${porcentaje}%</td>
        `;
        tablaRes.appendChild(tr);
    });

    // Finalizar renderizando la lista de actas y sus PDFs
    await renderActasList();
}

async function renderActasList() {
    const listBody = document.getElementById('tabla-actas-list');
    const filterDept = document.getElementById('filter-departamento');
    if (!listBody || !filterDept) return; // Only in index

    // Fetch all acts to populate filter if empty
    const { data: actas, error } = await supabaseClient
        .from('actas')
        .select('*')
        .order('fecha', { ascending: false });

    if (error || !actas) {
        listBody.innerHTML = `<tr><td colspan="5" style="text-align: center;">Error al cargar actas.</td></tr>`;
        return;
    }

    // Populate dropdown
    if (filterDept.options.length <= 1) {
        const deptos = [...new Set(actas.map(a => a.departamento))].sort();
        deptos.forEach(d => {
            const opt = document.createElement('option');
            opt.value = d;
            opt.textContent = d;
            filterDept.appendChild(opt);
        });
    }

    // Filter
    const selectedDept = filterDept.value;
    const filteredActas = selectedDept ? actas.filter(a => a.departamento === selectedDept) : actas;

    listBody.innerHTML = '';

    if (filteredActas.length === 0) {
        listBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No hay actas procesadas aún.</td></tr>`;
        return;
    }

    filteredActas.forEach(acta => {
        const tr = document.createElement('tr');
        const dateStr = new Date(acta.fecha).toLocaleString('es-SV', { dateStyle: 'short', timeStyle: 'short' });

        tr.innerHTML = `
            <td>${dateStr}</td>
            <td style="font-weight: 500;">${acta.centro_votacion}</td>
            <td>${acta.municipio} (${acta.zona}), ${acta.departamento}</td>
            <td style="font-weight: bold; color: var(--primary-color);">JRV-${acta.jrv}</td>
            <td>
                <button onclick="exportActaPDF('${acta.id}', ${acta.jrv})" style="background: none; border: none; color: var(--primary-color); cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.2rem; font-weight: 500;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
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

    // Título y Encabezado
    doc.setFillColor(15, 71, 175);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("REPORTE ELECTORAL NACIONAL", 14, 25);
    doc.setFontSize(10);
    doc.text("Conteo de Votos SV - En Tiempo Real", 14, 33);

    // Metadata
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`Fecha y Hora de Emisión:`, 14, 50);
    doc.setFont("helvetica", "normal");
    doc.text(`${new Date().toLocaleString('es-SV')}`, 65, 50);

    // Resumen de KPIs
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 55, 196, 55);

    const totalVotos = document.getElementById('stat-total-votos').textContent;
    const totalActas = document.getElementById('stat-actas').textContent;
    const participacion = document.getElementById('stat-participacion').textContent;

    doc.setFont("helvetica", "bold");
    doc.text("RESUMEN GENERAL", 14, 65);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Total Votos Contabilizados: ${totalVotos}`, 14, 72);
    doc.text(`Actas Procesadas (JRV): ${totalActas}`, 14, 78);
    doc.text(`Participación Estimada: ${participacion}`, 14, 84);

    // AGREGAR GRÁFICOS
    try {
        const pieCanvas = document.getElementById('pieChart');
        const barCanvas = document.getElementById('barChart');

        if (pieCanvas) {
            const pieImg = pieCanvas.toDataURL('image/png');
            doc.text("DISTRIBUCIÓN DE VOTOS", 14, 100);
            doc.addImage(pieImg, 'PNG', 14, 105, 80, 60); // Ajustar tamaño y posición
        }

        if (barCanvas) {
            const barImg = barCanvas.toDataURL('image/png');
            doc.text("TENDENCIA POR PARTIDO", 105, 100);
            doc.addImage(barImg, 'PNG', 105, 105, 90, 60);
        }
    } catch (e) {
        console.error("Error capturando gráficos:", e);
    }

    // TABLA DE DETALLES (Siguiente sección o página)
    doc.setFont("helvetica", "bold");
    doc.text("DETALLE POR PARTIDO POLÍTICO", 14, 180);

    const tableEl = document.querySelector('#tabla-resultados').parentElement.querySelector('table');

    doc.autoTable({
        startY: 185,
        html: tableEl,
        theme: 'striped',
        headStyles: { fillColor: [15, 71, 175], textColor: 255 },
        styles: { fontSize: 9 },
        margin: { top: 185 }
    });

    doc.save('reporte_electoral_nacional_sv.pdf');
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
    supabaseClient.channel('dashboard-updates')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'votos' }, payload => {
            console.log("Cambio detectado en Votos, actualizando Dashboard...", payload);
            renderDashboardData(partidos);
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'actas' }, payload => {
            console.log("Cambio detectado en Actas, actualizando Dashboard...", payload);
            renderDashboardData(partidos);
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

        btn.textContent = 'Verificando...';
        btn.disabled = true;

        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email, password
        });

        if (error) {
            showAlert('login-alert', 'Credenciales inválidas o error de red.', 'error');
            btn.textContent = 'Iniciar Sesión';
            btn.disabled = false;
        } else {
            window.location.href = 'admin.html';
        }
    });
}

// ==========================================
// LÓGICA DE PANEL ADMIN (admin.html)
// ==========================================
async function initAdmin() {
    console.log("Iniciando vista de Admin...");

    // Verificar autenticación
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) {
        window.location.href = 'login.html';
        return;
    }

    // Mostrar cuerpo una vez verificado
    document.getElementById('admin-body').style.display = 'block';
    document.getElementById('user-email').textContent = session.user.email;

    // Botón Logout
    document.getElementById('btn-logout').addEventListener('click', async () => {
        await supabaseClient.auth.signOut();
        window.location.href = 'index.html';
    });
    // Verificación de Perfil (Roles/Email)
    // El botón de Super Admin solo será visible para admin@gob.sv
    if (session.user.email === 'admin@gob.sv') {
        const navLinks = document.querySelector('.nav-links');
        const saBtn = document.createElement('a');
        saBtn.href = 'superadmin.html';
        saBtn.className = 'btn';
        saBtn.style.cssText = 'padding: 0.5rem 1rem; background: #FEF2F2; color: #EF4444; border: 1px solid #FECACA; text-decoration: none; margin-right: 1rem; font-weight: bold;';
        saBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: text-bottom; margin-right: 4px;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg> Zona Super Admin';
        navLinks.insertBefore(saBtn, document.getElementById('user-email'));
    }

    // Lógica Geográfica: Dept -> Zona -> Distrito
    const deptSelect = document.getElementById('departamento');
    const zonaSelect = document.getElementById('zona');
    const munSelect = document.getElementById('municipio');

    if (deptSelect && zonaSelect && munSelect) {
        // Al cambiar Departamento -> Cargar Zonas
        deptSelect.addEventListener('change', (e) => {
            const depto = e.target.value;
            zonaSelect.innerHTML = '<option value="">Seleccione Zona</option>';
            munSelect.innerHTML = '<option value="">Seleccione Distrito</option>';
            munSelect.disabled = true;

            if (depto && ESTRUCTURA_GEOGRAFICA_SV[depto]) {
                const zonas = Object.keys(ESTRUCTURA_GEOGRAFICA_SV[depto]);
                zonas.forEach(z => {
                    const opt = document.createElement('option');
                    opt.value = z;
                    opt.textContent = z;
                    zonaSelect.appendChild(opt);
                });
                zonaSelect.disabled = false;
            } else {
                zonaSelect.disabled = true;
            }
        });

        // Al cambiar Zona -> Cargar Municipios (Distritos)
        zonaSelect.addEventListener('change', (e) => {
            const depto = deptSelect.value;
            const zona = e.target.value;
            munSelect.innerHTML = '<option value="">Seleccione Distrito</option>';

            if (depto && zona && ESTRUCTURA_GEOGRAFICA_SV[depto][zona]) {
                ESTRUCTURA_GEOGRAFICA_SV[depto][zona].forEach(mun => {
                    const opt = document.createElement('option');
                    opt.value = mun;
                    opt.textContent = mun;
                    munSelect.appendChild(opt);
                });
                munSelect.disabled = false;
            } else {
                munSelect.disabled = true;
            }
        });
    }

    const partidos = await loadPartidos();
    const container = document.getElementById('partidos-votos-container');
    container.innerHTML = ''; // Clear loading

    // Generar inputs para votos
    partidos.forEach(p => {
        const div = document.createElement('div');
        div.className = 'form-group card';
        div.style.marginBottom = '0';
        div.style.boxShadow = 'none';

        div.innerHTML = `
            <div class="partido-header">
                <div class="partido-color-indicator" style="background-color: ${p.color};"></div>
                <label for="voto_${p.id}" class="form-label" style="margin-bottom: 0;">${p.sigla} - ${p.nombre}</label>
            </div>
            <input type="number" id="voto_${p.id}" data-partido-id="${p.id}" class="form-control" value="0" min="0" required>
        `;
        container.appendChild(div);
    });

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
                departamento: document.getElementById('departamento').value,
                zona: document.getElementById('zona').value,
                municipio: document.getElementById('municipio').value,
                user_id: session.user.id
            };

            // 1. Insertar Acta
            const { data: nuevaActa, error: actaError } = await supabaseClient
                .from('actas')
                .insert([actaData])
                .select('id')
                .single();

            if (actaError) throw actaError;

            // 2. Insertar Votos
            const votosToInsert = partidos.map(p => {
                const input = document.getElementById(`voto_${p.id}`);
                return {
                    acta_id: nuevaActa.id,
                    partido_id: p.id,
                    cantidad: parseInt(input.value) || 0
                };
            });

            const { error: votosError } = await supabaseClient
                .from('votos')
                .insert(votosToInsert);

            if (votosError) throw votosError;

            showAlert('admin-alert', 'Acta guardada correctamente e indexada al servidor.', 'success');
            form.reset();
            // Reset numerical values to 0
            partidos.forEach(p => {
                const input = document.getElementById(`voto_${p.id}`);
                if (input) input.value = "0";
            });

        } catch (error) {
            console.error("Error completo", error);
            // Comprobar si fue violacion unique constraint de JRV 
            if (error.code === '23505') {
                showAlert('admin-alert', 'La JRV ingresada ya se encuentra registrada en el sistema.', 'error');
            } else {
                showAlert('admin-alert', 'Error al guardar el acta. Detalles en consola.', 'error');
            }
        } finally {
            btn.disabled = false;
            btn.textContent = 'Guardar Acta Electoral';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
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
        } catch (err) {
            console.error(err);
            showAlert('superadmin-alert', 'Error creando usuario: ' + err.message, 'error');
        } finally {
            btn.disabled = false;
            btn.textContent = 'Registrar Auxiliar';
        }
    });
}
