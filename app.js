/**
 * MAIN APPLICATION CONTROLLER
 * Handles Areosence Authentication, Navigation Router, Telemetry Simulation Engine, & UI Interactions.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Application State
  const state = {
    isAuthenticated: false,
    currentUser: null,
    activeTab: 'dashboard',
    simMode: 'auto', // 'auto' | 'good' | 'mod' | 'poor' | 'haz'
    telemetry: {
      aqi: 42,
      ppm: 420,
      temp: 24.5,
      humidity: 55,
      espUptime: 14200,
      wifiRssi: -58
    },
    logs: []
  };

  // Instantiate Modules
  let gauge = null;
  let chart = null;
  let schematic = null;

  // Initialize UI & Event Listeners
  initAuth();
  initRouter();
  initGaugeAndChart();
  initSimulation();
  initContactForm();
  initCodeCopy();
  initLogExport();

  // Start Telemetry Update Loop (Every 2 seconds)
  setInterval(updateTelemetry, 2000);

  // =========================================================================
  // AUTHENTICATION SYSTEM (SIGN IN & REGISTRATION)
  // =========================================================================

  function initAuth() {
    const authOverlay = document.getElementById('authOverlay');
    const appContainer = document.getElementById('appContainer');
    const authForm = document.getElementById('authForm');
    const regForm = document.getElementById('regForm');
    const authError = document.getElementById('authError');
    const authErrorText = document.getElementById('authErrorText');
    const authSuccess = document.getElementById('authSuccess');
    const authSuccessText = document.getElementById('authSuccessText');

    const tabSignIn = document.getElementById('tabSignIn');
    const tabRegister = document.getElementById('tabRegister');
    const toRegisterLink = document.getElementById('toRegisterLink');
    const toSignInLink = document.getElementById('toSignInLink');

    const emailInput = document.getElementById('emailInput');
    const passInput = document.getElementById('passInput');
    const regNameInput = document.getElementById('regNameInput');
    const regEmailInput = document.getElementById('regEmailInput');
    const regPassInput = document.getElementById('regPassInput');
    const regPassConfirmInput = document.getElementById('regPassConfirmInput');

    const demoPills = document.querySelectorAll('.demo-pill');
    const logoutBtn = document.getElementById('logoutBtn');
    const userNameSpan = document.getElementById('userNameText');
    const userAvatarDiv = document.getElementById('userAvatarMini');

    // Ensure interface starts locked until sign-in
    state.isAuthenticated = false;
    state.currentUser = null;
    if (appContainer) appContainer.classList.add('locked');
    if (authOverlay) authOverlay.classList.remove('hidden');

    // Helper: Get stored registered users from LocalStorage
    function getRegisteredUsers() {
      try {
        const stored = localStorage.getItem('areosence_users');
        return stored ? JSON.parse(stored) : [];
      } catch (err) {
        return [];
      }
    }

    // Helper: Save registered users to LocalStorage
    function saveRegisteredUsers(users) {
      try {
        localStorage.setItem('areosence_users', JSON.stringify(users));
      } catch (err) {
        console.error('LocalStorage write failed:', err);
      }
    }

    // UI Helper: Display Error Banner
    function showError(msg) {
      if (authSuccess) authSuccess.style.display = 'none';
      if (authError) {
        if (authErrorText) authErrorText.textContent = msg;
        authError.style.display = 'flex';
      }
    }

    // UI Helper: Display Success Banner
    function showSuccess(msg) {
      if (authError) authError.style.display = 'none';
      if (authSuccess) {
        if (authSuccessText) authSuccessText.textContent = msg;
        authSuccess.style.display = 'flex';
      }
    }

    // UI Helper: Clear Banners
    function clearAlerts() {
      if (authError) authError.style.display = 'none';
      if (authSuccess) authSuccess.style.display = 'none';
    }

    // Tab Switcher (Sign In vs Register)
    function switchTab(mode) {
      clearAlerts();
      if (mode === 'signin') {
        if (tabSignIn) tabSignIn.classList.add('active');
        if (tabRegister) tabRegister.classList.remove('active');
        if (authForm) authForm.style.display = 'flex';
        if (regForm) regForm.style.display = 'none';
      } else if (mode === 'register') {
        if (tabRegister) tabRegister.classList.add('active');
        if (tabSignIn) tabSignIn.classList.remove('active');
        if (regForm) regForm.style.display = 'flex';
        if (authForm) authForm.style.display = 'none';
      }
    }

    if (tabSignIn) tabSignIn.addEventListener('click', () => switchTab('signin'));
    if (tabRegister) tabRegister.addEventListener('click', () => switchTab('register'));
    if (toRegisterLink) toRegisterLink.addEventListener('click', () => switchTab('register'));
    if (toSignInLink) toSignInLink.addEventListener('click', () => switchTab('signin'));

    // Perform Successful Login
    function performLogin(name, email) {
      clearAlerts();
      const cleanUser = name || email || 'IT26101389';
      const formattedName = cleanUser.charAt(0).toUpperCase() + cleanUser.slice(1);

      state.currentUser = { name: formattedName, email: email || cleanUser };
      state.isAuthenticated = true;

      // Update User Badge in Header
      if (userNameSpan) userNameSpan.textContent = state.currentUser.name;
      if (userAvatarDiv) userAvatarDiv.textContent = state.currentUser.name.charAt(0).toUpperCase();

      // Unlock Main Application
      if (appContainer) appContainer.classList.remove('locked');
      if (authOverlay) authOverlay.classList.add('hidden');

      if (gauge) gauge.resizeCanvas();
    }

    // --- 1. SIGN IN FORM SUBMIT ---
    if (authForm) {
      authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        clearAlerts();

        const inputUser = emailInput ? emailInput.value.trim() : '';
        const inputPass = passInput ? passInput.value.trim() : '';

        if (!inputUser) {
          showError('Please enter your Student ID, Email, or Username.');
          return;
        }

        if (!inputPass) {
          showError('Please enter your password.');
          return;
        }

        // Check against registered users
        const registeredUsers = getRegisteredUsers();
        const foundUser = registeredUsers.find(
          u => u.email.toLowerCase() === inputUser.toLowerCase() || u.name.toLowerCase() === inputUser.toLowerCase()
        );

        if (foundUser) {
          if (foundUser.password !== inputPass) {
            showError('Invalid password. Please check your credentials.');
            return;
          }
          performLogin(foundUser.name, foundUser.email);
        } else {
          // Default demo fallback login for any student ID/email provided
          const cleanName = inputUser.includes('@') ? inputUser.split('@')[0] : inputUser;
          performLogin(cleanName, inputUser);
        }
      });
    }

    // --- 2. REGISTER FORM SUBMIT ---
    if (regForm) {
      regForm.addEventListener('submit', (e) => {
        e.preventDefault();
        clearAlerts();

        const nameVal = regNameInput ? regNameInput.value.trim() : '';
        const emailVal = regEmailInput ? regEmailInput.value.trim() : '';
        const passVal = regPassInput ? regPassInput.value : '';
        const confirmVal = regPassConfirmInput ? regPassConfirmInput.value : '';

        if (!nameVal || !emailVal) {
          showError('Please fill in all required user information.');
          return;
        }

        if (passVal.length < 4) {
          showError('Password must be at least 4 characters long.');
          return;
        }

        if (passVal !== confirmVal) {
          showError('Passwords do not match. Please verify.');
          return;
        }

        const registeredUsers = getRegisteredUsers();
        const existing = registeredUsers.find(
          u => u.email.toLowerCase() === emailVal.toLowerCase()
        );

        if (existing) {
          showError('An account with this Email/ID already exists. Please Sign In.');
          return;
        }

        // Register new user
        const newUser = { name: nameVal, email: emailVal, password: passVal };
        registeredUsers.push(newUser);
        saveRegisteredUsers(registeredUsers);

        showSuccess('Account registered successfully! Logging you in...');

        setTimeout(() => {
          performLogin(nameVal, emailVal);
        }, 800);
      });
    }

    // --- 3. QUICK DEMO LOGIN PILLS ---
    demoPills.forEach(pill => {
      pill.addEventListener('click', (e) => {
        e.preventDefault();
        const role = pill.dataset.role;
        let displayName = 'IT26101389 (Student)';
        let email = 'student@sliit.lk';

        if (role === 'professor') {
          displayName = 'Prof. Evaluator';
          email = 'evaluator@sliit.lk';
        } else if (role === 'guest') {
          displayName = 'Guest Explorer';
          email = 'guest@areosence.com';
        }

        if (emailInput) emailInput.value = email;
        if (passInput) passInput.value = '123456';

        performLogin(displayName, email);
      });
    });

    // --- 4. SIGN OUT / LOGOUT ---
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        state.isAuthenticated = false;
        state.currentUser = null;
        if (appContainer) appContainer.classList.add('locked');
        if (authOverlay) authOverlay.classList.remove('hidden');
        if (passInput) passInput.value = '';
        if (regPassInput) regPassInput.value = '';
        if (regPassConfirmInput) regPassConfirmInput.value = '';
        switchTab('signin');
      });
    }
  }

  // =========================================================================
  // SPA PAGE NAVIGATION ROUTER
  // =========================================================================

  function initRouter() {
    const navTabs = document.querySelectorAll('.nav-tab');
    const pageViews = document.querySelectorAll('.page-view');

    navTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        const targetPage = tab.dataset.page;

        if (targetPage === state.activeTab) return;

        // Update Active Nav Tab
        navTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Switch Page View with Animation
        pageViews.forEach(view => {
          if (view.id === `page-${targetPage}`) {
            view.classList.add('active');
          } else {
            view.classList.remove('active');
          }
        });

        state.activeTab = targetPage;

        // Special page triggers
        if (targetPage === 'technology' && !schematic) {
          schematic = new window.CircuitSchematic('circuitCanvasWrapper');
        }

        if (targetPage === 'dashboard' && gauge) {
          gauge.resizeCanvas();
        }
      });
    });
  }

  // =========================================================================
  // GAUGE & CHART INITIALIZATION
  // =========================================================================

  function initGaugeAndChart() {
    if (window.AQIGauge) {
      gauge = new window.AQIGauge('aqiGaugeCanvas');
      gauge.setValue(state.telemetry.aqi);
    }

    if (window.LiveChartManager) {
      chart = new window.LiveChartManager('liveChartCanvas');
    }
  }

  // =========================================================================
  // TELEMETRY SIMULATION & ALERTS ENGINE
  // =========================================================================

  function initSimulation() {
    const simBtns = document.querySelectorAll('.btn-sim');

    simBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        simBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const mode = btn.dataset.sim;
        state.simMode = mode;
        updateTelemetry(true); // Force immediate update
      });
    });
  }

  function updateTelemetry(force = false) {
    if (!state.isAuthenticated && !force) return;

    let targetAqi = state.telemetry.aqi;

    // Determine target AQI based on simulation mode (4-Tier Scale)
    if (state.simMode === 'good') {
      targetAqi = Math.round(15 + (Math.random() * 30)); // 0 - 50 (Good)
    } else if (state.simMode === 'mod') {
      targetAqi = Math.round(55 + (Math.random() * 40)); // 51 - 100 (Moderate)
    } else if (state.simMode === 'poor') {
      targetAqi = Math.round(105 + (Math.random() * 85)); // 101 - 200 (Poor)
    } else if (state.simMode === 'haz') {
      targetAqi = Math.round(210 + (Math.random() * 260)); // 201 - 500 (Hazardous)
    } else {
      // Auto Random Walk
      const delta = (Math.random() - 0.48) * 8;
      targetAqi = Math.min(Math.max(Math.round(state.telemetry.aqi + delta), 10), 480);
    }

    state.telemetry.aqi = targetAqi;
    state.telemetry.ppm = Math.round(targetAqi * 4.5 + 150);
    state.telemetry.temp = +(23.5 + (Math.random() * 2.5)).toFixed(1);
    state.telemetry.humidity = Math.round(52 + (Math.random() * 8));
    state.telemetry.espUptime += 2;

    // Update UI elements
    if (gauge) gauge.setValue(state.telemetry.aqi);

    // Update Dashboard Value Readouts
    const valAqi = document.getElementById('readoutAqi');
    const valPpm = document.getElementById('readoutPpm');
    const valTemp = document.getElementById('readoutTemp');
    const valHumidity = document.getElementById('readoutHumidity');
    const valUptime = document.getElementById('readoutUptime');
    const statusBadge = document.getElementById('gaugeStatusBadge');
    const hazardBanner = document.getElementById('hazardAlertBanner');

    if (valAqi) valAqi.textContent = state.telemetry.aqi;
    if (valPpm) valPpm.textContent = state.telemetry.ppm;
    if (valTemp) valTemp.textContent = state.telemetry.temp;
    if (valHumidity) valHumidity.textContent = state.telemetry.humidity;
    if (valUptime) valUptime.textContent = formatUptime(state.telemetry.espUptime);

    // Update Status Badge & Hazard Alarm Banner based on 4-Tier AQI scale (Hazardous > 200)
    const statusInfo = getStatusInfo(state.telemetry.aqi);
    if (statusBadge) {
      statusBadge.className = `gauge-status-badge ${statusInfo.class}`;
      statusBadge.innerHTML = `<i class="fa-solid ${statusInfo.icon}"></i> ${statusInfo.text}`;
    }

    if (hazardBanner) {
      if (state.telemetry.aqi > 200) {
        hazardBanner.style.display = 'flex';
      } else {
        hazardBanner.style.display = 'none';
      }
    }

    // Update Stream Chart
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    if (chart) {
      chart.addDataPoint(timeStr, {
        aqi: state.telemetry.aqi,
        ppm: state.telemetry.ppm,
        temp: state.telemetry.temp,
        humidity: state.telemetry.humidity
      });
    }

    // Log high severity changes
    checkAndAddLog(state.telemetry.aqi, statusInfo, timeStr);
  }

  function getStatusInfo(aqi) {
    if (aqi <= 50) {
      return { text: 'GOOD', class: 'status-good', icon: 'fa-circle-check', bg: '#10b981' };
    } else if (aqi <= 100) {
      return { text: 'MODERATE', class: 'status-moderate', icon: 'fa-triangle-exclamation', bg: '#f59e0b' };
    } else if (aqi <= 200) {
      return { text: 'POOR', class: 'status-poor', icon: 'fa-cloud', bg: '#f97316' };
    } else {
      return { text: 'HAZARDOUS', class: 'status-hazardous', icon: 'fa-biohazard', bg: '#ef4444' };
    }
  }

  function formatUptime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  }

  // =========================================================================
  // LOG SYSTEM & EXPORT
  // =========================================================================

  function checkAndAddLog(aqi, statusInfo, timestamp) {
    const tableBody = document.getElementById('logTableBody');
    if (!tableBody) return;

    // Add entry every 10 ticks or if hazardous
    if (state.logs.length === 0 || state.telemetry.ppm > 1500 || Math.random() < 0.2) {
      const logEntry = {
        time: timestamp,
        aqi: aqi,
        ppm: state.telemetry.ppm,
        temp: `${state.telemetry.temp} °C`,
        status: statusInfo.text,
        bg: statusInfo.bg
      };

      state.logs.unshift(logEntry);
      if (state.logs.length > 15) state.logs.pop();

      // Re-render Table
      tableBody.innerHTML = state.logs.map(log => `
        <tr>
          <td><span style="font-family: var(--font-mono);">${log.time}</span></td>
          <td><strong>${log.aqi}</strong> AQI</td>
          <td>${log.ppm} PPM</td>
          <td>${log.temp}</td>
          <td>
            <span class="badge-status" style="background: ${log.bg}22; color: ${log.bg}; border: 1px solid ${log.bg};">
              ${log.status}
            </span>
          </td>
        </tr>
      `).join('');
    }
  }

  function initLogExport() {
    const exportBtn = document.getElementById('btnExportLogs');
    if (!exportBtn) return;

    exportBtn.addEventListener('click', () => {
      if (state.logs.length === 0) {
        alert('No telemetry log data recorded yet!');
        return;
      }

      let csv = 'Timestamp,AQI,Gas_PPM,Temperature,Status\n';
      state.logs.forEach(l => {
        csv += `"${l.time}",${l.aqi},${l.ppm},"${l.temp}","${l.status}"\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `esp32_air_quality_logs_${Date.now()}.csv`;
      a.click();
    });
  }

  // =========================================================================
  // CODE VIEWER & CONTACT FORM
  // =========================================================================

  function initCodeCopy() {
    const copyBtn = document.getElementById('btnCopyCode');
    const codeBlock = document.getElementById('esp32CodeSnippet');

    if (copyBtn && codeBlock) {
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(codeBlock.textContent.trim()).then(() => {
          const origText = copyBtn.innerHTML;
          copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
          setTimeout(() => copyBtn.innerHTML = origText, 2000);
        });
      });
    }
  }

  function initContactForm() {
    const form = document.getElementById('contactForm');
    const modal = document.getElementById('contactConfirmModal');
    const closeModalBtn = document.getElementById('btnCloseContactModal');

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (modal) {
          modal.classList.add('active');
        }
        form.reset();
      });
    }

    if (closeModalBtn && modal) {
      closeModalBtn.addEventListener('click', () => {
        modal.classList.remove('active');
      });
    }
  }
});
