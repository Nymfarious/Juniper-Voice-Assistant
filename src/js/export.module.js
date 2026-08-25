/* global state */
import { jsPDF } from 'jspdf';

function downloadBlob(name, type, content) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

function portableSetup() {
  return {
    format: 'nymfarious.juniper-setup',
    version: 1,
    exportedAt: new Date().toISOString(),
    profile: state.info,
    insurance: state.insurances,
    pharmacies: state.pharmacies,
    scripts: state.myScripts,
    scriptLibrary: state.fullScripts,
    phrases: {
      introduction: { label: state.introLabel, text: state.introText },
      verification: { label: state.verifyLabel, text: state.verifyText }
    },
    preferences: {
      voiceProvider: state.selectedVoiceProvider,
      voiceId: state.selectedVoiceId,
      speakingPace: state.speechSpeed,
      loudness: state.speechVolume
    }
  };
}

window.downloadJuniperSetup = function downloadJuniperSetup() {
  const stamp = new Date().toISOString().slice(0, 10);
  downloadBlob(`Juniper-Setup-${stamp}.json`, 'application/json', JSON.stringify(portableSetup(), null, 2));
};

function checked(id) {
  return Boolean(document.getElementById(id)?.checked);
}

function addHeading(pdf, text, y) {
  pdf.setFont('times', 'bold');
  pdf.setFontSize(16);
  pdf.setTextColor(24, 91, 102);
  pdf.text(text, 18, y);
  return y + 8;
}

function addLines(pdf, lines, y) {
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(38, 48, 52);
  for (const line of lines.filter(Boolean)) {
    const wrapped = pdf.splitTextToSize(String(line), 174);
    if (y + wrapped.length * 5 > 278) {
      pdf.addPage();
      y = 22;
    }
    pdf.text(wrapped, 18, y);
    y += wrapped.length * 5 + 2;
  }
  return y;
}

window.downloadJuniperPacket = function downloadJuniperPacket() {
  const pdf = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
  pdf.setProperties({ title: 'Juniper Communication Packet', subject: 'Private selected Juniper information', creator: 'Juniper' });
  pdf.setFillColor(236, 247, 245);
  pdf.rect(0, 0, 210, 297, 'F');
  pdf.setFont('times', 'bold');
  pdf.setFontSize(28);
  pdf.setTextColor(24, 91, 102);
  pdf.text('Juniper Communication Packet', 105, 112, { align: 'center' });
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(11);
  pdf.setTextColor(65, 82, 85);
  pdf.text('Giving back a voice, one prepared phrase at a time.', 105, 128, { align: 'center' });

  let y = 24;
  pdf.addPage();
  if (checked('exportProfile')) {
    const name = [state.info.firstName, state.info.lastName].filter(Boolean).join(' ');
    const profileLines = [
      name && `Name: ${name}`,
      state.info.nickname && `Preferred name: ${state.info.nickname}`,
      state.info.dob && `Date of birth: ${state.info.dob}`,
      state.info.phone && `Phone: ${state.info.phone}`,
      [state.info.address1, state.info.address2, state.info.city, state.info.state, state.info.zip].filter(Boolean).join(', '),
    ].filter(Boolean);
    if (profileLines.length) {
      y = addHeading(pdf, 'Profile', y);
      y = addLines(pdf, profileLines, y);
    }
  }
  if (checked('exportInsurance') && state.insurances.length) {
    y = addHeading(pdf, 'Insurance', y + 5);
    y = addLines(pdf, state.insurances.map(item => [
      `${item.type || 'Insurance'}: ${item.provider || 'Provider not recorded'}`,
      item.memberId && `Member ID: ${item.memberId}`,
      item.group && `Group: ${item.group}`,
      item.phone && `Phone: ${item.phone}`,
    ].filter(Boolean).join(' | ')), y);
  }
  if (checked('exportPharmacies') && state.pharmacies.length) {
    y = addHeading(pdf, 'Pharmacies', y + 5);
    y = addLines(pdf, state.pharmacies.map(item => [item.name, item.location, item.phone, item.address].filter(Boolean).join(' | ')), y);
  }
  if (checked('exportScripts')) {
    y = addHeading(pdf, 'Prepared scripts and phrases', y + 5);
    const scripts = [
      `${state.introLabel}: ${state.introText}`,
      `${state.verifyLabel}: ${state.verifyText}`,
      ...state.myScripts.map(script => `${script.name || 'Script'}: ${script.text || ''}`),
      ...Object.values(state.fullScripts).flat().map(script => `${script.name || 'Script'}: ${script.text || ''}`),
    ];
    addLines(pdf, scripts, y);
  }

  const pages = pdf.getNumberOfPages();
  for (let page = 1; page <= pages; page += 1) {
    pdf.setPage(page);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(90, 104, 106);
    pdf.text('Private - selected by the Juniper user', 18, 287);
    pdf.text(`${page} / ${pages}`, 192, 287, { align: 'right' });
  }
  pdf.save(`Juniper-Communication-Packet-${new Date().toISOString().slice(0, 10)}.pdf`);
};
