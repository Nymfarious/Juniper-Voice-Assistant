// Juniper v6.3.1 - App State & Initialization

// ============================================
// STATE
// ============================================
const state = {
  // API keys are intentionally memory-only. Persisting them in browser storage
  // makes a shared-device compromise much more damaging.
  apiKey: '',
  
  // Voice
  allVoices: [],
  filteredVoices: [],
  specialVoices: [],
  selectedVoiceId: localStorage.getItem('juniperVoiceId') || '',
  speechSpeed: parseFloat(localStorage.getItem('juniperSpeed') || '0.95'),
  currentAudio: null,
  isTesting: false,
  
  // User Info
  info: readStoredJson(sessionStorage, 'juniperInfo', readStoredJson(localStorage, 'juniperInfo', {})),
  insurances: readStoredJson(sessionStorage, 'juniperInsurances', readStoredJson(localStorage, 'juniperInsurances', [])),
  pharmacies: readStoredJson(sessionStorage, 'juniperPharmacies', readStoredJson(localStorage, 'juniperPharmacies', [])),
  
  // History & Scripts
  history: readStoredJson(sessionStorage, 'juniperHistory', readStoredJson(localStorage, 'juniperHistory', [])),
  myScripts: readStoredJson(sessionStorage, 'juniperScripts', readStoredJson(localStorage, 'juniperScripts', [])),
  fullScripts: readStoredJson(sessionStorage, 'juniperFullScripts', readStoredJson(localStorage, 'juniperFullScripts', {
    doctor: [{id: 1, name: 'Schedule Appointment', text: "Hello, I'm Juniper calling on behalf of [FIRST] [LAST]. We'd like to schedule an appointment. Date of birth is [DOB]."}],
    pharmacy: [{id: 2, name: 'Refill Rx', text: "Hello, I'm Juniper calling on behalf of [FIRST] [LAST]. We need to refill a prescription. DOB is [DOB]."}],
    transport: [{id: 3, name: 'Schedule Ride', text: "Hello, I'm Juniper calling on behalf of [FIRST] [LAST]. We need a ride. Pickup at [ADDRESS]."}],
    insurance: [{id: 4, name: 'Coverage Question', text: "Hello, I'm Juniper calling on behalf of [FIRST] [LAST]. We have a question. Member ID is [INSURANCE]."}],
    custom: []
  })),
  currentCat: 'doctor',
  
  // UI State
  selectedIcon: '⭐',
  editingBtn: '',
  
  // Custom Button Text
  introText: sessionStorage.getItem('juniperIntroText') || localStorage.getItem('juniperIntroText') || "Hello, I'm Juniper, a voice assistant calling on behalf of [FULL_NAME]. [FIRST] can hear you but uses me to communicate. How may I help?",
  introLabel: sessionStorage.getItem('juniperIntroLabel') || localStorage.getItem('juniperIntroLabel') || '"Hello, I\'m Juniper..."',
  verifyText: sessionStorage.getItem('juniperVerifyText') || localStorage.getItem('juniperVerifyText') || "I'll let [FIRST] verify that directly. [FIRST], go ahead.",
  verifyLabel: sessionStorage.getItem('juniperVerifyLabel') || localStorage.getItem('juniperVerifyLabel') || '"Let me verify..."'
};

// ============================================
// INITIALIZATION
// ============================================
function init() {
  // One-time cleanup for keys saved by releases before 6.3.1.
  localStorage.removeItem('juniperApiKey');
  localStorage.removeItem('juniperClaudeKey');

  document.querySelectorAll('.form-group > label').forEach(label => {
    const control = label.parentElement.querySelector('input, select, textarea');
    if (control?.id) label.htmlFor = control.id;
  });

  // Clear the "Type Anything" input field on load
  const customTextInput = document.getElementById('customText');
  if (customTextInput) {
    customTextInput.value = '';
  }
  
  loadInfoFields();
  updateHeaderName();
  updateBtnLabels();
  
  // API Key Status
  // Speed Slider
  document.getElementById('speedSlider').value = state.speechSpeed;
  document.getElementById('speedValue').textContent = state.speechSpeed.toFixed(2) + 'x';
  document.getElementById('speedSlider').addEventListener('input', (e) => {
    state.speechSpeed = parseFloat(e.target.value);
    document.getElementById('speedValue').textContent = state.speechSpeed.toFixed(2) + 'x';
    localStorage.setItem('juniperSpeed', state.speechSpeed);
  });
  
  // Enter key for custom text
  document.getElementById('customText').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') speakCustom();
  });
  
  // Hotkey buttons
  document.querySelectorAll('.hotkey-btn[data-msg]').forEach(b => {
    b.addEventListener('click', () => speak(b.dataset.msg));
  });
  
  document.querySelectorAll('.hotkey-btn[data-info]').forEach(b => {
    b.addEventListener('click', () => speakInfo(b.dataset.info));
  });
  
  // Render UI
  renderMyScripts();
  renderHistory();
  renderInsurances();
  renderPharmacies();
  renderQuickScripts();

  MiniMantis.report('app_loaded', 'ok', { version: '6.3.1' });
}

// Run on load
window.addEventListener('load', init);
