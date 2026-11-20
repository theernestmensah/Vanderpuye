const day = 86400000;
const election = Date.UTC(2026, 11, 19);
const launch = Date.UTC(2026, 10, 21, 14);
const counters = [...document.querySelectorAll('[data-cd]')];
function updateCountdown() {
  const remaining = Math.max(0, Math.floor((election - Date.now()) / 1000));
  const values = [Math.floor(remaining / 86400), Math.floor(remaining / 3600) % 24, Math.floor(remaining / 60) % 60, remaining % 60];
  counters.forEach((counter, index) => { counter.textContent = String(values[index]).padStart(2, '0'); });
  document.querySelector('[data-days]').textContent = values[0];
  const days = Math.floor(launch / day) - Math.floor(Date.now() / day);
  document.querySelector('[data-launch-days]').textContent = Date.now() > launch ? '' : days === 0 ? 'Today, 2PM' : days === 1 ? 'Tomorrow, 2PM' : 'In ' + days + ' days';
}
updateCountdown();
setInterval(updateCountdown, 1000);

const menu = document.querySelector('.agenda-menu');
document.addEventListener('click', event => {
  if (!menu.contains(event.target) || event.target.closest('.agenda-links a')) menu.open = false;
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu.open) {
    menu.open = false;
    menu.querySelector('summary').focus();
  }
});
const form = document.querySelector('.join-form');
const button = form.querySelector('[type=submit]');
const status = form.querySelector('[role=status]');
form.addEventListener('submit', async event => {
  event.preventDefault();
  if (button.disabled) return;
  button.disabled = true;
  status.textContent = 'Sending your signup…';
  try {
    const response = await fetch('/', { method: 'POST', body: new URLSearchParams(new FormData(form)) });
    if (!response.ok) throw new Error('Submission failed');
    form.reset();
    location.assign(form.action);
  } catch {
    status.textContent = 'We could not confirm your signup. Please check your connection or use the campaign contact links.';
    button.disabled = false;
  }
});
window.addEventListener('pageshow', () => { button.disabled = false; status.textContent = ''; });
