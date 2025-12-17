// Juniper v6.2.1 - User Info Helpers

// ============================================
// NAME HELPERS
// ============================================
function getFirstName() {
  return state.info.pronounceFirst || state.info.firstName || 'the caller';
}

function getLastName() {
  return state.info.pronounceLast || state.info.lastName || '';
}

function getFullName() {
  const first = state.info.pronounceFirst || state.info.firstName || '';
  const last = state.info.pronounceLast || state.info.lastName || '';
  return (first + ' ' + last).trim() || 'the caller';
}

function getDisplayName() {
  return state.info.pronounceNick || state.info.nickname || 
         state.info.pronounceFirst || state.info.firstName || 'the caller';
}

function getFullAddress() {
  let a = state.info.address1 || '';
  if (state.info.address2) a += ', ' + state.info.address2;
  if (state.info.city) a += ', ' + state.info.city;
  if (state.info.state) a += ', ' + state.info.state;
  if (state.info.zip) a += ' ' + state.info.zip;
  return a || 'address not set';
}

function getPrimaryInsurance() {
  const p = state.insurances.find(i => i.type === 'Medical') || state.insurances[0];
  return p ? p.memberId : 'not set';
}

function getPrimaryPharmacy() {
  const p = state.pharmacies.find(p => p.primary) || state.pharmacies[0];
  return p ? p.name : 'not set';
}

// ============================================
// PLACEHOLDER REPLACEMENT
// ============================================
function replacePlaceholders(text) {
  return text
    .replace(/\[FIRST\]/g, getFirstName())
    .replace(/\[LAST\]/g, getLastName())
    .replace(/\[FULL_NAME\]/g, getFullName())
    .replace(/\[DOB\]/g, state.info.dob || '[DOB]')
    .replace(/\[PHONE\]/g, state.info.phone || '[PHONE]')
    .replace(/\[ADDRESS\]/g, getFullAddress())
    .replace(/\[INSURANCE\]/g, getPrimaryInsurance())
    .replace(/\[PHARMACY\]/g, getPrimaryPharmacy())
    .replace(/\[NAME\]/g, getFullName());
}

// ============================================
// HEADER UPDATE
// ============================================
function updateHeaderName() {
  const name = state.info.nickname || state.info.firstName || '';
  document.getElementById('headerSubtitle').textContent = 
    name ? name + "'s AI Voice Assistant" : "Your AI Voice Assistant";
}

function updateBtnLabels() {
  document.getElementById('introBtnText').textContent = state.introLabel;
  document.getElementById('verifyBtnText').textContent = state.verifyLabel;
}

// ============================================
// LOAD/SAVE INFO
// ============================================
function loadInfoFields() {
  document.getElementById('infoFirstName').value = state.info.firstName || '';
  document.getElementById('infoLastName').value = state.info.lastName || '';
  document.getElementById('infoNickname').value = state.info.nickname || '';
  document.getElementById('infoPronounceFirst').value = state.info.pronounceFirst || '';
  document.getElementById('infoPronounceLast').value = state.info.pronounceLast || '';
  document.getElementById('infoPronounceNick').value = state.info.pronounceNick || '';
  document.getElementById('infoDOB').value = state.info.dob || '';
  document.getElementById('infoPhone').value = state.info.phone || '';
  document.getElementById('infoAddress1').value = state.info.address1 || '';
  document.getElementById('infoAddress2').value = state.info.address2 || '';
  document.getElementById('infoCity').value = state.info.city || '';
  document.getElementById('infoState').value = state.info.state || '';
  document.getElementById('infoZip').value = state.info.zip || '';
}

function autoSaveInfo() {
  state.info = {
    firstName: document.getElementById('infoFirstName').value.trim(),
    lastName: document.getElementById('infoLastName').value.trim(),
    nickname: document.getElementById('infoNickname').value.trim(),
    pronounceFirst: document.getElementById('infoPronounceFirst').value.trim(),
    pronounceLast: document.getElementById('infoPronounceLast').value.trim(),
    pronounceNick: document.getElementById('infoPronounceNick').value.trim(),
    dob: document.getElementById('infoDOB').value.trim(),
    phone: document.getElementById('infoPhone').value.trim(),
    address1: document.getElementById('infoAddress1').value.trim(),
    address2: document.getElementById('infoAddress2').value.trim(),
    city: document.getElementById('infoCity').value.trim(),
    state: document.getElementById('infoState').value.trim(),
    zip: document.getElementById('infoZip').value.trim()
  };
  localStorage.setItem('juniperInfo', JSON.stringify(state.info));
  updateHeaderName();
}

function saveInfo() {
  autoSaveInfo();
  setStatus('ready', 'Saved!');
}

// ============================================
// API KEYS
// ============================================
function saveApiKey() {
  const k = document.getElementById('apiKey').value.trim();
  if (k && !k.includes('•')) {
    state.apiKey = k;
    localStorage.setItem('juniperApiKey', k);
    document.getElementById('apiKey').value = '••••••';
    document.getElementById('keyStatus').textContent = '✓ Saved';
    document.getElementById('keyStatus').className = 'key-status saved';
    loadVoices();
  }
}

function saveClaudeKey() {
  const k = document.getElementById('claudeKey').value.trim();
  if (k && !k.includes('•')) {
    state.claudeKey = k;
    localStorage.setItem('juniperClaudeKey', k);
    document.getElementById('claudeKey').value = '••••••';
    document.getElementById('claudeStatus').textContent = '✓ Saved';
    document.getElementById('claudeStatus').className = 'key-status saved';
  }
}
