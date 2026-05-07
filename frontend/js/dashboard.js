// Mostrar nombre del usuario autenticado PRIMERO, antes que cualquier otra cosa
// Intentar multiples posibles claves para compatibilidad
const userName = localStorage.getItem('userName') 
                || localStorage.getItem('name') 
                || localStorage.getItem('nombre')
                || localStorage.getItem('usuario_nombre');
const displayName = userName && userName.trim() !== '' ? userName.trim() : 'Usuario';
document.getElementById('userGreeting').textContent = `Hola, ${displayName} 👋`;

// Función de animación de números (Counters)
function animateCounter(element, target) {
    const speed = 200;
    element.innerText = '0';
    
    const updateCount = () => {
        const count = +element.innerText;
        const inc = target / speed;
        if (count < target) {
            element.innerText = Math.ceil(count + inc);
            setTimeout(updateCount, 1);
        } else {
            element.innerText = target.toLocaleString() + ' L';
        }
    };
    setTimeout(updateCount, 300);
}

function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.toggle('active', section.id === sectionId);
    });

    document.querySelectorAll('.sidebar-nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.section === sectionId);
    });
}

function setConfigUserInfo() {
    const email = localStorage.getItem('userEmail') || localStorage.getItem('email') || 'No disponible';
    const name = localStorage.getItem('userName') || localStorage.getItem('nombre') || localStorage.getItem('name') || 'Usuario';
    const info = document.getElementById('configUserInfo');
    if (info) {
        info.innerHTML = `<strong>${name}</strong><br>${email}`;
    }
}

function populateHistoryTable(datosHistoricos) {
    const historyTableBody = document.getElementById('historyTableBody');
    const noHistoryMessage = document.getElementById('noHistoryMessage');
    if (!historyTableBody || !noHistoryMessage) return;

    historyTableBody.innerHTML = '';
    if (!datosHistoricos || datosHistoricos.length === 0) {
        noHistoryMessage.style.display = 'block';
        return;
    }

    noHistoryMessage.style.display = 'none';
    datosHistoricos.forEach(dia => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${new Date(`${dia.fecha}T12:00:00`).toLocaleDateString('es-MX', { timeZone: 'America/Mexico_City', day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
            <td>${Number(dia.litros) || 0}</td>
            <td>${Number(dia.calidad) || 0}%</td>
        `;
        historyTableBody.appendChild(fila);
    });
}

function updateRefreshStatus(message) {
    const status = document.getElementById('refreshStatus');
    if (status) {
        status.textContent = message;
    }
}

async function refreshDashboardData() {
    const refreshBtn = document.getElementById('btnRefreshData');
    if (refreshBtn) {
        refreshBtn.disabled = true;
        refreshBtn.textContent = 'Refrescando...';
    }
    updateRefreshStatus('Refrescando datos...');

    await Promise.all([
        cargarDatosDashboard(),
        cargarDatosHistoricos()
    ]);

    const now = new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City', hour: '2-digit', minute: '2-digit', second: '2-digit' });
    updateRefreshStatus(`Última actualización: ${now}`);
    if (refreshBtn) {
        refreshBtn.disabled = false;
        refreshBtn.textContent = 'Refrescar datos';
    }
}

// Use relative API paths in producción y localhost during desarrollo
const API_URL = (function getApiUrl() {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:') {
        return 'http://localhost:3000/api';
    }
    return '/api';
})();

// Generar etiquetas para los últimos 7 días en zona horaria Guadalajara
function getLast7DayLabels() {
    const labels = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        labels.push(new Intl.DateTimeFormat('es-MX', { timeZone: 'America/Mexico_City', weekday: 'short' }).format(date));
    }
    return labels;
}

// Cargar datos del dashboard desde la API
async function cargarDatosDashboard() {
    // Obtener token del localStorage
    const token = localStorage.getItem('token');
    
    console.log('[DEBUG] cargarDatosDashboard()');
    console.log('[DEBUG] Token en localStorage:', token ? `Presente (${token.substring(0, 20)}...)` : 'NO PRESENTE');
    
    if (!token) {
        // No hay token, redirigir al login
        console.log('[ERROR] No hay token en localStorage, redirigiendo a login');
        window.location.href = 'login.html';
        return;
    }

    try {
        console.log('[DEBUG] Llamando a /api/datos con token...');
        const respuesta = await fetch(`${API_URL}/datos`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('[DEBUG] Respuesta status:', respuesta.status);
        console.log('[DEBUG] Respuesta ok:', respuesta.ok);

        if (!respuesta.ok) {
            const errorData = await respuesta.json().catch(() => ({}));
            console.error('[ERROR] Error en respuesta:', errorData);
            
            // ✅ SOLO redirigir si es ERROR DE AUTENTICACIÓN REAL (401 o 403)
            if (respuesta.status === 401 || respuesta.status === 403) {
                console.log('[ERROR] Token inválido o expirado, redirigiendo a login');
                localStorage.removeItem('token');
                localStorage.removeItem('userName');
                localStorage.removeItem('userEmail');
                window.location.href = 'login.html';
                return;
            }
            
            // ✅ Para otros errores (500, error de servidor, conexión) NO BORRAR SESION
            // Solo mostrar error y continuar con datos por defecto
            console.log('[WARN] Error del servidor, pero la sesión sigue siendo válida');
            alert('Hubo un error al cargar los datos. Intenta actualizar la página.');
            return;
        }

        const datos = await respuesta.json();
        
        // Actualizar tarjetas con datos recibidos
        const litrosTotales = Number(datos.litros_totales) || 0;
        const litrosHoy = Number(datos.litros_hoy) || 0;
        const calidadAgua = Number(datos.calidad_agua) || 0;

        animateCounter(document.getElementById('litrosTotalesElem'), litrosTotales);
        animateCounter(document.getElementById('litrosHoyElem'), litrosHoy);
        document.getElementById('calidadAguaElem').innerText = `${calidadAgua}%`;

        // Estado del filtro
        const estadoFiltro = datos.estado_filtro || 'Desconocido';
        // Si no existe la tarjeta del filtro la creamos dinámicamente
        const cardsGrid = document.querySelector('.cards-grid');
        if (cardsGrid.querySelectorAll('.stat-card').length < 4) {
            const tarjetaFiltro = document.createElement('div');
            tarjetaFiltro.className = 'stat-card';
            tarjetaFiltro.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                        <h4>Estado del Filtro</h4>
                        <div class="value" style="color: ${estadoFiltro === 'bueno' ? '#10b981' : estadoFiltro === 'regular' ? '#f59e0b' : '#ef4444'};">${estadoFiltro.charAt(0).toUpperCase() + estadoFiltro.slice(1)}</div>
                    </div>
                    <div style="font-size: 2em; opacity: 0.8;">🔧</div>
                </div>
            `;
            cardsGrid.appendChild(tarjetaFiltro);
        }

        // Mostrar alertas si existen
        const alertsTableBody = document.getElementById('alertsTableBody');
        const noAlertsMessage = document.getElementById('noAlertsMessage');
        
        if (datos.alertas && datos.alertas.length > 0) {
            console.log('Alertas recibidas:', datos.alertas);
            
            // Limpiar tabla
            alertsTableBody.innerHTML = '';
            
            // Insertar cada alerta en la tabla
            datos.alertas.forEach(alerta => {
                const fila = document.createElement('tr');
                fila.innerHTML = `
                    <td>${new Date(alerta.fecha).toLocaleString('es-MX', { timeZone: 'America/Mexico_City', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                    <td><span style="color: ${alerta.tipo === 'Filtro saturado' ? '#ef4444' : alerta.tipo === 'Calidad baja' ? '#f59e0b' : '#3b82f6'};">${alerta.tipo}</span></td>
                    <td>${alerta.descripcion}</td>
                `;
                alertsTableBody.appendChild(fila);
            });
            
            // Mostrar tabla y ocultar mensaje sin alertas
            document.getElementById('alertsTable').style.display = 'table';
            noAlertsMessage.style.display = 'none';
        } else {
            // Ocultar tabla y mostrar mensaje sin alertas
            document.getElementById('alertsTable').style.display = 'none';
            noAlertsMessage.style.display = 'block';
        }

    } catch (error) {
        console.error('Error al cargar datos del dashboard:', error);
        // Manejar error de conexión
        alert('Error de conexión. Por favor intenta nuevamente.');
    }
}

// Variable global para la instancia del gráfico
let dashboardChart;

// Inicializar gráfico
function inicializarGrafico(datosConsumo = [350, 420, 380, 500, 450, 600, 480]) {
    const ctx = document.getElementById('dashboardChart').getContext('2d');
    dashboardChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: getLast7DayLabels(),
            datasets: [{
                label: 'Consumo (Litros)',
                data: datosConsumo,
                borderColor: '#007bff',
                backgroundColor: 'rgba(0, 123, 255, 0.15)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#007bff',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(255,255,255,0.05)'
                    },
                    ticks: {
                        color: '#94a3b8'
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(255,255,255,0.05)'
                    },
                    ticks: {
                        color: '#94a3b8'
                    }
                }
            },
            animation: {
                duration: 2000,
                easing: 'easeOutQuart'
            }
        }
    });
}

// Cargar datos históricos de consumo
async function cargarDatosHistoricos() {
    const token = localStorage.getItem('token');
    
    if (!token) return;

    try {
        const respuesta = await fetch(`${API_URL}/historico`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        // ✅ NO borrar sesion aunque falle este endpoint
        if (respuesta.status === 401 || respuesta.status === 403) {
            localStorage.removeItem('token');
            localStorage.removeItem('userName');
            localStorage.removeItem('userEmail');
            window.location.href = 'login.html';
            return;
        }

        if (respuesta.ok && dashboardChart) {
            const datosHistoricos = await respuesta.json();
            
            // Extraer solo los valores de litros para el gráfico
            const valoresLitros = datosHistoricos.map(dia => Number(dia.litros) || 0);
            
            // Actualizar etiquetas del gráfico de acuerdo a la zona horaria Guadalajara
            const etiquetas = datosHistoricos.map(dia => {
                const localDate = new Date(`${dia.fecha}T12:00:00`);
                return new Intl.DateTimeFormat('es-MX', { timeZone: 'America/Mexico_City', weekday: 'short' }).format(localDate);
            });
            dashboardChart.data.labels = etiquetas;
            dashboardChart.data.datasets[0].data = valoresLitros;
            dashboardChart.update();
            populateHistoryTable(datosHistoricos);
        } else {
            populateHistoryTable([]);
        }

    } catch (error) {
        console.error('Error al cargar datos históricos:', error);
    }
}

// Funcionalidad cerrar sesión
document.querySelector('.btn-cerrarS').addEventListener('click', function() {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    window.location.href = 'login.html';
});

// Ejecutar cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar gráfico primero
    inicializarGrafico();
    
    // Cargar datos desde la API
    cargarDatosDashboard();
    
    // Cargar datos históricos para actualizar el gráfico
    cargarDatosHistoricos();

    // Configurar navegación lateral
    document.querySelectorAll('.sidebar-nav-item').forEach(item => {
        item.addEventListener('click', () => {
            if (item.dataset.section) {
                showSection(item.dataset.section);
            }
        });
    });

    // Cargar información de configuración
    setConfigUserInfo();

    const refreshBtn = document.getElementById('btnRefreshData');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshDashboardData);
    }

    showSection('section-resumen');

    // Actualizar automaticamente cada 30 segundos
    setInterval(() => {
        cargarDatosDashboard();
        cargarDatosHistoricos();
        console.log('[AUTO-REFRESH] Datos actualizados automaticamente');
    }, 30000);
});
