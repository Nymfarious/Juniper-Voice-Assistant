// Juniper v6.4.0 - UI Functions

let modalOpener = null;

// ============================================
// COLLAPSE
// ============================================
function toggleCollapse(id) {
  const content = document.getElementById(id + '-content');
  content.classList.toggle('collapsed');
  const toggle = document.querySelector(`[aria-controls="${content.id}"]`);
  if (toggle) toggle.setAttribute('aria-expanded', String(!content.classList.contains('collapsed')));
}

// ============================================
// TABS
// ============================================
function showTab(tab, btn) {
  document.querySelectorAll('#tab-common, #tab-info, #tab-calls').forEach(x => x.classList.remove('active'));
  document.querySelectorAll('.card .tabs .tab').forEach(x => x.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.add('active');
  btn.classList.add('active');
  document.querySelectorAll('.card .tabs .tab').forEach(x => x.setAttribute('aria-selected', String(x === btn)));
}

function showInfoTab(tab, btn) {
  document.querySelectorAll('[id^="info-"]').forEach(x => x.classList.remove('active'));
  document.querySelectorAll('#infoModal .modal-tab').forEach(x => x.classList.remove('active'));
  document.getElementById('info-' + tab).classList.add('active');
  btn.classList.add('active');
  document.querySelectorAll('#infoModal .modal-tab').forEach(x => x.setAttribute('aria-selected', String(x === btn)));
}

// ============================================
// MODALS
// ============================================
function openModal(id) {
  const overlay = document.getElementById(id);
  modalOpener = document.activeElement;
  overlay.classList.add('show');
  overlay.setAttribute('aria-hidden', 'false');
  document.querySelector('.container').setAttribute('inert', '');
  overlay.querySelector('.modal-close, button, input, select, textarea')?.focus();
}

function closeModal(id) {
  const overlay = document.getElementById(id);
  overlay.classList.remove('show');
  overlay.setAttribute('aria-hidden', 'true');
  const remainingOverlay = document.querySelector('.modal-overlay.show');
  if (!remainingOverlay) document.querySelector('.container').removeAttribute('inert');
  modalOpener?.focus();
  modalOpener = null;
}

function openInfoModal() {
  openModal('infoModal');
  loadInfoFields();
}

function closeInfoModal() {
  closeModal('infoModal');
  autoSaveInfo();
}

function openVoiceModal() {
  openModal('voiceModal');
  if (!state.allVoices.length) loadVoices();
}

function closeVoiceModal() {
  closeModal('voiceModal');
}

function openFullScriptsModal() {
  openModal('fullScriptsModal');
  showScriptCategory('doctor', document.querySelector('.script-tabs .modal-tab'));
}

function closeFullScriptsModal() {
  closeModal('fullScriptsModal');
}

function openAgentsModal() {
  openModal('agentsModal');
}

function closeAgentsModal() {
  closeModal('agentsModal');
}

function openMyScriptModal() {
  openModal('myScriptModal');
  document.getElementById('myScriptName').value = '';
  document.getElementById('myScriptText').value = '';
  state.selectedIcon = '⭐';
  document.querySelectorAll('.icon-option').forEach(i => {
    i.classList.toggle('selected', i.dataset.icon === '⭐');
  });
}

function closeMyScriptModal() {
  closeModal('myScriptModal');
}

function closeAddInsuranceModal() {
  closeModal('addInsuranceModal');
}

function closeAddPharmacyModal() {
  closeModal('addPharmacyModal');
}

// ============================================
// EDIT BUTTON MODAL
// ============================================
function editIntroBtn() {
  state.editingBtn = 'intro';
  document.getElementById('editBtnTitle').textContent = 'Edit Intro';
  document.getElementById('editBtnLabel').value = state.introLabel;
  document.getElementById('editBtnText').value = state.introText;
  openModal('editBtnModal');
}

function editVerifyBtn() {
  state.editingBtn = 'verify';
  document.getElementById('editBtnTitle').textContent = 'Edit Verify';
  document.getElementById('editBtnLabel').value = state.verifyLabel;
  document.getElementById('editBtnText').value = state.verifyText;
  openModal('editBtnModal');
}

function closeEditBtnModal() {
  closeModal('editBtnModal');
}

function saveEditBtn() {
  const label = document.getElementById('editBtnLabel').value.trim();
  const text = document.getElementById('editBtnText').value.trim();
  
  if (!label || !text) {
    alert('Fill both fields');
    return;
  }
  
  if (state.editingBtn === 'intro') {
    state.introLabel = label;
    state.introText = text;
    sessionStorage.setItem('juniperIntroLabel', label);
    sessionStorage.setItem('juniperIntroText', text);
  } else {
    state.verifyLabel = label;
    state.verifyText = text;
    sessionStorage.setItem('juniperVerifyLabel', label);
    sessionStorage.setItem('juniperVerifyText', text);
  }
  
  updateBtnLabels();
  closeEditBtnModal();
}

// ============================================
// ICON PICKER
// ============================================
function selectIcon(el) {
  document.querySelectorAll('.icon-option').forEach(i => i.classList.remove('selected'));
  el.classList.add('selected');
  state.selectedIcon = el.dataset.icon;
}

// ============================================
// TOGGLE SETTINGS
// ============================================
function toggleSetting(setting) {
  const id = 'toggle' + setting.charAt(0).toUpperCase() + setting.slice(1);
  const button = document.getElementById(id);
  button.classList.toggle('active');
  button.setAttribute('aria-pressed', String(button.classList.contains('active')));
}

document.addEventListener('keydown', event => {
  const openOverlay = document.querySelector('.modal-overlay.show');
  if (!openOverlay) return;
  if (event.key === 'Escape') {
    openOverlay.querySelector('.modal-close')?.click();
    return;
  }
  if (event.key !== 'Tab') return;
  const focusable = [...openOverlay.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href]')]
    .filter(element => element.offsetParent !== null);
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});
