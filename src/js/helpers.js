// Juniper v6.4.0 - User Info Helpers

function readStoredJson(storage, key, fallback) {
  try {
    const stored = storage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch (error) {
    console.warn(`Ignoring invalid ${key} data`, error);
    return fallback;
  }
}

function replaceChildrenWith(container, children) {
  container.replaceChildren(...children);
}

function createElement(tag, options = {}, children = []) {
  const element = document.createElement(tag);
  if (options.className) element.className = options.className;
  if (options.text !== undefined) element.textContent = options.text;
  if (options.type) element.type = options.type;
  if (options.ariaLabel) element.setAttribute('aria-label', options.ariaLabel);
  children.forEach(child => element.append(child));
  return element;
}

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
  document.getElementById('headerSubtitle').textContent = 'Giving you back your voice.';
}

function updateBtnLabels() {
  document.getElementById('introBtnText').textContent = state.introLabel;
  document.getElementById('verifyBtnText').textContent = state.verifyLabel;
}

// ============================================
// LOAD/SAVE INFO
// ============================================
function loadInfoFields() {
  const fields = ['firstName', 'lastName', 'nickname', 'pronounceFirst', 'pronounceLast', 'dob', 'phone', 'address1', 'address2', 'city', 'state', 'zip'];
  fields.forEach(id => {
    document.getElementById(id).value = state.info[id] || '';
  });
}

function autoSaveInfo() {
  state.info = {
    firstName: document.getElementById('firstName').value.trim(),
    lastName: document.getElementById('lastName').value.trim(),
    nickname: document.getElementById('nickname').value.trim(),
    pronounceFirst: document.getElementById('pronounceFirst').value.trim(),
    pronounceLast: document.getElementById('pronounceLast').value.trim(),
    dob: document.getElementById('dob').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    address1: document.getElementById('address1').value.trim(),
    address2: document.getElementById('address2').value.trim(),
    city: document.getElementById('city').value.trim(),
    state: document.getElementById('state').value.trim(),
    zip: document.getElementById('zip').value.trim()
  };
  sessionStorage.setItem('juniperInfo', JSON.stringify(state.info));
  updateHeaderName();
}

function saveInfo() {
  autoSaveInfo();
  setStatus('ready', 'Saved!');
}

// ============================================
// API KEYS
// ============================================
function updateBackendStatus(message = '') {
  const status = document.getElementById('backendAuthStatus');
  const user = window.JuniperBackend?.currentUser?.();
  if (status && message) status.textContent = message;
  else if (status) status.textContent = user ? `Signed in as ${user.email || 'approved user'}` : 'Not signed in';
}

async function signInToBackend() {
  try {
    await window.JuniperBackend?.signIn();
    await loadVoices();
  } catch (error) {
    updateBackendStatus(error.message || 'Google sign-in failed');
  }
}

async function switchBackendAccount() {
  try {
    await window.JuniperBackend?.switchAccount?.();
    state.allVoices = [];
    state.specialVoices = [];
    state.filteredVoices = [];
    await loadVoices();
  } catch (error) {
    updateBackendStatus(error.message || 'Google account switch was canceled');
  }
}

async function signOutOfBackend() {
  await window.JuniperBackend?.signOut();
  state.allVoices = [];
  state.specialVoices = [];
  state.filteredVoices = [];
  state.selectedVoiceProvider = 'device';
  state.selectedVoiceId = 'device-default';
  localStorage.setItem('juniperVoiceProvider', 'device');
  localStorage.setItem('juniperVoiceId', 'device-default');
  document.getElementById('voiceAccessMessage').textContent = 'Device voice ready · Sign in for cloud voices';
  document.getElementById('voiceAccessSignIn').hidden = false;
  document.getElementById('voiceAccessSwitch').hidden = true;
  document.getElementById('voiceAccessSignOut').hidden = true;
  document.getElementById('backendSignIn').hidden = false;
  document.getElementById('backendSwitch').hidden = true;
  document.getElementById('backendSignOut').hidden = true;
  await loadVoices();
  updateBackendStatus();
}

function clearPrivateData() {
  if (!window.confirm('Clear profile, insurance, pharmacy, history, scripts, and customized phrases from this browser? This cannot be undone.')) return;
  const privateKeys = ['juniperInfo', 'juniperInsurances', 'juniperPharmacies', 'juniperHistory', 'juniperScripts', 'juniperFullScripts', 'juniperIntroText', 'juniperIntroLabel', 'juniperVerifyText', 'juniperVerifyLabel'];
  privateKeys.forEach(key => {
    sessionStorage.removeItem(key);
    localStorage.removeItem(key);
  });
  MiniMantis.report('private_data_cleared', 'ok');
  window.location.reload();
}

async function runJuniperExport(action) {
  await import('./export.js');
  const handler = window[action];
  if (typeof handler === 'function') handler();
}
