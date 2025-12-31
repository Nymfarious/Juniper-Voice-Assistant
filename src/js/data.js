// Juniper v6.2.1 - Insurance & Pharmacy

// ============================================
// INSURANCE
// ============================================
function addInsurance() {
  document.getElementById('addInsuranceModal').classList.add('show');
  ['insProvider', 'insMemberId', 'insGroup', 'insPhone', 'insRxBin', 'insRxPcn']
    .forEach(id => document.getElementById(id).value = '');
}

function saveInsurance() {
  const ins = {
    id: Date.now(),
    type: document.getElementById('insType').value,
    provider: document.getElementById('insProvider').value.trim(),
    memberId: document.getElementById('insMemberId').value.trim(),
    group: document.getElementById('insGroup').value.trim(),
    phone: document.getElementById('insPhone').value.trim(),
    rxBin: document.getElementById('insRxBin').value.trim(),
    rxPcn: document.getElementById('insRxPcn').value.trim()
  };
  
  if (!ins.provider) {
    alert('Enter provider');
    return;
  }
  
  state.insurances.push(ins);
  localStorage.setItem('juniperInsurances', JSON.stringify(state.insurances));
  renderInsurances();
  closeAddInsuranceModal();
}

function deleteInsurance(id) {
  state.insurances = state.insurances.filter(i => i.id !== id);
  localStorage.setItem('juniperInsurances', JSON.stringify(state.insurances));
  renderInsurances();
}

function renderInsurances() {
  const container = document.getElementById('insuranceList');
  
  container.innerHTML = state.insurances.length 
    ? state.insurances.map(i => 
        `<div class="item-card">
          <div class="item-card-header">
            <span class="item-card-title">${i.type}: ${i.provider}</span>
            <button class="item-card-delete" onclick="deleteInsurance(${i.id})">🗑️</button>
          </div>
          <div class="item-card-detail">ID: ${i.memberId || '-'}</div>
          <div class="item-card-detail">Group: ${i.group || '-'}</div>
        </div>`
      ).join('')
    : '<div class="loading-msg">No insurance</div>';
}

// ============================================
// PHARMACY
// ============================================
function addPharmacy() {
  document.getElementById('addPharmacyModal').classList.add('show');
  ['pharmName', 'pharmLocation', 'pharmPhone', 'pharmAddress']
    .forEach(id => document.getElementById(id).value = '');
  document.getElementById('pharmPrimary').value = 'no';
}

function savePharmacy() {
  const ph = {
    id: Date.now(),
    name: document.getElementById('pharmName').value.trim(),
    location: document.getElementById('pharmLocation').value.trim(),
    phone: document.getElementById('pharmPhone').value.trim(),
    address: document.getElementById('pharmAddress').value.trim(),
    primary: document.getElementById('pharmPrimary').value === 'yes'
  };
  
  if (!ph.name) {
    alert('Enter name');
    return;
  }
  
  // If setting as primary, remove primary from others
  if (ph.primary) {
    state.pharmacies.forEach(p => p.primary = false);
  }
  
  state.pharmacies.push(ph);
  localStorage.setItem('juniperPharmacies', JSON.stringify(state.pharmacies));
  renderPharmacies();
  closeAddPharmacyModal();
}

function deletePharmacy(id) {
  state.pharmacies = state.pharmacies.filter(p => p.id !== id);
  localStorage.setItem('juniperPharmacies', JSON.stringify(state.pharmacies));
  renderPharmacies();
}

function renderPharmacies() {
  const container = document.getElementById('pharmacyList');
  
  container.innerHTML = state.pharmacies.length 
    ? state.pharmacies.map(p => 
        `<div class="item-card">
          <div class="item-card-header">
            <span class="item-card-title">
              ${p.name}${p.primary ? '<span class="primary-tag">Primary</span>' : ''}
            </span>
            <button class="item-card-delete" onclick="deletePharmacy(${p.id})">🗑️</button>
          </div>
          <div class="item-card-detail">📞 ${p.phone || '-'}</div>
        </div>`
      ).join('')
    : '<div class="loading-msg">No pharmacies</div>';
}
