// Juniper v6.3.1 - Insurance & Pharmacy

// ============================================
// INSURANCE
// ============================================
function addInsurance() {
  openModal('addInsuranceModal');
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
  sessionStorage.setItem('juniperInsurances', JSON.stringify(state.insurances));
  renderInsurances();
  closeAddInsuranceModal();
}

function deleteInsurance(id) {
  state.insurances = state.insurances.filter(i => i.id !== id);
  sessionStorage.setItem('juniperInsurances', JSON.stringify(state.insurances));
  renderInsurances();
}

function renderInsurances() {
  const container = document.getElementById('insuranceList');
  
  if (!state.insurances.length) {
    replaceChildrenWith(container, [createElement('div', { className: 'loading-msg', text: 'No insurance' })]);
    return;
  }
  replaceChildrenWith(container, state.insurances.map(insurance => {
    const deleteButton = createElement('button', { className: 'item-card-delete', text: '🗑️', type: 'button', ariaLabel: `Delete ${insurance.provider} insurance` });
    deleteButton.addEventListener('click', () => deleteInsurance(insurance.id));
    return createElement('div', { className: 'item-card' }, [
      createElement('div', { className: 'item-card-header' }, [
        createElement('span', { className: 'item-card-title', text: `${insurance.type}: ${insurance.provider}` }),
        deleteButton
      ]),
      createElement('div', { className: 'item-card-detail', text: `ID: ${insurance.memberId || '-'}` }),
      createElement('div', { className: 'item-card-detail', text: `Group: ${insurance.group || '-'}` })
    ]);
  }));
}

// ============================================
// PHARMACY
// ============================================
function addPharmacy() {
  openModal('addPharmacyModal');
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
  sessionStorage.setItem('juniperPharmacies', JSON.stringify(state.pharmacies));
  renderPharmacies();
  closeAddPharmacyModal();
}

function deletePharmacy(id) {
  state.pharmacies = state.pharmacies.filter(p => p.id !== id);
  sessionStorage.setItem('juniperPharmacies', JSON.stringify(state.pharmacies));
  renderPharmacies();
}

function renderPharmacies() {
  const container = document.getElementById('pharmacyList');
  
  if (!state.pharmacies.length) {
    replaceChildrenWith(container, [createElement('div', { className: 'loading-msg', text: 'No pharmacies' })]);
    return;
  }
  replaceChildrenWith(container, state.pharmacies.map(pharmacy => {
    const titleChildren = [document.createTextNode(pharmacy.name)];
    if (pharmacy.primary) titleChildren.push(createElement('span', { className: 'primary-tag', text: 'Primary' }));
    const deleteButton = createElement('button', { className: 'item-card-delete', text: '🗑️', type: 'button', ariaLabel: `Delete ${pharmacy.name} pharmacy` });
    deleteButton.addEventListener('click', () => deletePharmacy(pharmacy.id));
    return createElement('div', { className: 'item-card' }, [
      createElement('div', { className: 'item-card-header' }, [
        createElement('span', { className: 'item-card-title' }, titleChildren),
        deleteButton
      ]),
      createElement('div', { className: 'item-card-detail', text: `📞 ${pharmacy.phone || '-'}` })
    ]);
  }));
}
