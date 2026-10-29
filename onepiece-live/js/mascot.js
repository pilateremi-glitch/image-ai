// Le personnage du thème qui lance la roue : il prend son élan, pousse la roue, puis réagit au résultat.
const Mascot = (() => {
  let el, img, bubble, timer;

  function mount(container) {
    el = document.createElement('div');
    el.className = 'mascot idle';
    el.innerHTML = '<div class="bubble hidden"></div><img alt="Personnage qui lance la roue">';
    img = el.querySelector('img'); bubble = el.querySelector('.bubble');
    // Personnage détouré ; à défaut, médaillon découpé dans l'illustration du thème
    img.onerror = () => { img.onerror = null; el.classList.add('portrait'); img.src = 'assets/theme.webp'; };
    img.src = 'assets/spinner.webp';
    container.appendChild(el);
    say('Achète ta participation et je fais tourner la roue !', 5000);
  }

  function play(cls, ms) {
    if (!el) return;
    el.classList.remove('idle', 'throw', 'cheer', 'sad', 'spinning');
    void el.offsetWidth; // relance l'animation
    el.classList.add(cls);
    if (ms) setTimeout(() => { el.classList.remove(cls); el.classList.add('idle'); }, ms);
  }

  function say(text, ms = 4000) {
    if (!bubble) return;
    bubble.textContent = text; bubble.classList.remove('hidden');
    clearTimeout(timer);
    if (ms) timer = setTimeout(() => bubble.classList.add('hidden'), ms);
  }

  // Élan puis poussée : la promesse se résout au moment où la main touche la roue
  function launch(pseudo) {
    say(pseudo ? `À toi ${pseudo} ! GOMU GOMU NO… ROUE !!` : 'GOMU GOMU NO… ROUE !!', 0);
    play('throw');
    return new Promise(res => setTimeout(() => { el?.classList.remove('throw'); el?.classList.add('spinning'); res(); }, 650));
  }
  function result(label) { play('cheer', 1600); say(`Ton objectif : ${label} !`, 0); }
  function won(pseudo) { play('cheer', 2400); say(`${pseudo || 'Bravo'}, tu as GAGNÉ !! 🍖`, 6000); }
  function lost() { play('sad', 2000); say('Pas cette fois… on retente ?', 5000); }
  function cancelled() { play('sad', 1500); say('Tour annulé, on rejoue !', 4000); }

  return { mount, say, launch, result, won, lost, cancelled };
})();
