// Juniper v6.2.1 - UI Functions

// ============================================
// COLLAPSE
// ============================================
function toggleCollapse(id) {
  const content = document.getElementById(id + '-content');
  content.classList.toggle('collapsed');
  content.previousElementSibling.classList.toggle('collapsed');
}

// ============================================
// TABS
// ============================================
function showTab(tab, btn) {
  document.querySelectorAll('#tab-common, #tab-info, #tab-calls').forEach(x => x.classList.remove('active'));
  document.querySelectorAll('.card .tabs .tab').forEach(x => x.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.add('active');
  btn.classList.add('active');
}

function showInfoTab(tab, btn) {
  document.querySelectorAll('[id^="infoTab-"]').forEach(x => x.classList.remove('active'));
  document.querySelectorAll('#infoModal .modal-tab').forEach(x => x.classList.remove('active'));
  document.getElementById('infoTab-' + tab).classList.add('active');
  btn.classList.add('active');
}

// ============================================
// MODALS
// ============================================
function openInfoModal() {
  document.getElementById('infoModal').classList.add('show');
  loadInfoFields();
}

function closeInfoModal() {
  document.getElementById('infoModal').classList.remove('show');
  autoSaveInfo();
}

function openVoiceModal() {
  document.getElementById('voiceModal').classList.add('show');
  if (state.apiKey && !state.allVoices.length) loadVoices();
}

function closeVoiceModal() {
  document.getElementById('voiceModal').classList.remove('show');
}

function openFullScriptsModal() {
  document.getElementById('fullScriptsModal').classList.add('show');
  showScriptCategory('doctor', document.querySelector('.script-tab'));
}

function closeFullScriptsModal() {
  document.getElementById('fullScriptsModal').classList.remove('show');
}

function openAgentsModal() {
  document.getElementById('agentsModal').classList.add('show');
}

function closeAgentsModal() {
  document.getElementById('agentsModal').classList.remove('show');
}

function openMyScriptModal() {
  document.getElementById('myScriptModal').classList.add('show');
  document.getElementById('myScriptName').value = '';
  document.getElementById('myScriptText').value = '';
  state.selectedIcon = '⭐';
  document.querySelectorAll('.icon-option').forEach(i => {
    i.classList.toggle('selected', i.dataset.icon === '⭐');
  });
}

function closeMyScriptModal() {
  document.getElementById('myScriptModal').classList.remove('show');
}

function closeAddInsuranceModal() {
  document.getElementById('addInsuranceModal').classList.remove('show');
}

function closeAddPharmacyModal() {
  document.getElementById('addPharmacyModal').classList.remove('show');
}

// ============================================
// EDIT BUTTON MODAL
// ============================================
function editIntroBtn() {
  state.editingBtn = 'intro';
  document.getElementById('editBtnTitle').textContent = 'Edit Intro';
  document.getElementById('editBtnLabel').value = state.introLabel;
  document.getElementById('editBtnText').value = state.introText;
  document.getElementById('editBtnModal').classList.add('show');
}

function editVerifyBtn() {
  state.editingBtn = 'verify';
  document.getElementById('editBtnTitle').textContent = 'Edit Verify';
  document.getElementById('editBtnLabel').value = state.verifyLabel;
  document.getElementById('editBtnText').value = state.verifyText;
  document.getElementById('editBtnModal').classList.add('show');
}

function closeEditBtnModal() {
  document.getElementById('editBtnModal').classList.remove('show');
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
    localStorage.setItem('juniperIntroLabel', label);
    localStorage.setItem('juniperIntroText', text);
  } else {
    state.verifyLabel = label;
    state.verifyText = text;
    localStorage.setItem('juniperVerifyLabel', label);
    localStorage.setItem('juniperVerifyText', text);
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
  document.getElementById(id).classList.toggle('active');
}
