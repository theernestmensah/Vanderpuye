const donationForm = document.querySelector('#donation-form');
if (donationForm) {
  const custom = donationForm.querySelector('#custom-donation');
  const amountLabel = donationForm.querySelector('#donation-button-label');
  const status = donationForm.querySelector('#donation-status');
  const selectedAmount = () => custom.value || donationForm.querySelector('input[name="amount"]:checked')?.value;
  const updateAmount = () => {
    const amount = Number(selectedAmount());
    amountLabel.textContent = amount > 0 ? `Donate GHS ${amount.toLocaleString('en-GH', { maximumFractionDigits: 2 })}` : 'Choose a donation amount';
    status.textContent = '';
  };
  donationForm.querySelectorAll('input[name="amount"]').forEach(input => input.addEventListener('change', () => { custom.value = ''; updateAmount(); }));
  custom.addEventListener('input', () => {
    if (custom.value) donationForm.querySelectorAll('input[name="amount"]').forEach(input => { input.checked = false; });
    updateAmount();
  });
  donationForm.addEventListener('submit', event => {
    event.preventDefault();
    if (!donationForm.reportValidity()) return;
    if (!(Number(selectedAmount()) > 0)) {
      status.textContent = 'Choose an amount or enter a contribution of at least GHS 1.';
      custom.focus();
      return;
    }
    status.textContent = 'Online donations are not open yet. No contribution has been taken. Please check back for the campaign’s verified payment options.';
  });
}

const volunteerForm = document.querySelector('#volunteer-form');
if (volunteerForm) {
  volunteerForm.addEventListener('submit', event => {
    event.preventDefault();
    if (!volunteerForm.reportValidity()) return;
    const fields = new FormData(volunteerForm);
    const details = {
      name: String(fields.get('name')).trim(),
      phone: String(fields.get('phone')).trim(),
      region: fields.get('region'),
      interest: fields.get('interest'),
      message: String(fields.get('message')).trim(),
      status: 'Saved locally by the applicant; not submitted to the campaign'
    };
    if (!details.name) {
      volunteerForm.elements.name.setCustomValidity('Enter your full name.');
      volunteerForm.elements.name.reportValidity();
      return;
    }
    const url = URL.createObjectURL(new Blob([JSON.stringify(details, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'my-volunteer-details.json';
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    document.querySelector('#volunteer-status').textContent = 'Your details file is ready to save. Nothing has been sent to the campaign.';
  });
  volunteerForm.elements.name.addEventListener('input', () => volunteerForm.elements.name.setCustomValidity(''));
}
