const menu = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('#mobile-nav');
function closeMenu(){menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Open navigation');mobileNav.hidden=true;}
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close navigation':'Open navigation');mobileNav.hidden=!open;});
mobileNav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!mobileNav.hidden){closeMenu();menu.focus();}});
const progress=document.querySelector('.reading-progress');
let scheduled=false;
function updateProgress(){const max=document.documentElement.scrollHeight-innerHeight;progress.style.transform=`scaleX(${max>0?scrollY/max:0})`;scheduled=false;}
addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(updateProgress);}},{passive:true});
addEventListener('resize',()=>{if(innerWidth>1100)closeMenu();updateProgress();});
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
if(!reduced.matches){const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('section-enter');observer.unobserve(entry.target);}});},{threshold:.2});document.querySelectorAll('.support-section h2, .volunteer-heading h2').forEach(el=>observer.observe(el));}
const motionButton=document.createElement('button');motionButton.className='motion-control';motionButton.type='button';motionButton.textContent='Pause ticker';motionButton.setAttribute('aria-pressed','false');
motionButton.addEventListener('click',()=>{const pause=document.documentElement.classList.toggle('motion-paused');motionButton.textContent=pause?'Resume ticker':'Pause ticker';motionButton.setAttribute('aria-pressed',String(pause));});document.body.append(motionButton);
updateProgress();
