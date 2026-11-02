export const interstitialTypes = ['octahedral', 'tetrahedral'];
export const emptyInterstitialState = () => Object.fromEntries(interstitialTypes.map(type => [type, {enabled: false, index: 0, all: false}]));

// Both locations edit one state; geometry and radii are never editable.
export function createInterstitialControls(containers, onChange) {
  const cards = [];
  let current;
  for (const container of containers) {
    for (const type of interstitialTypes) {
      const card = document.createElement('div');
      card.className = `interstitial-card ${type}`;
      card.innerHTML = `<label class="checkbox-row interstitial-toggle"><span class="interstitial-name"><span class="hole-swatch" aria-hidden="true"></span><span class="hole-name"></span></span><input type="checkbox"></label>
        <div class="polyhedron-selection" hidden><div class="site-navigation"><button type="button" class="site-step previous"><svg class="icon" aria-hidden="true"><use href="#i-arrow"/></svg></button><span class="site-position" aria-live="polite"></span><button type="button" class="site-step next"><svg class="icon" aria-hidden="true"><use href="#i-arrow"/></svg></button></div><label class="all-sites"><input type="checkbox"><span></span></label></div>`;
      const name = card.querySelector('.hole-name');
      const toggle = card.querySelector('.interstitial-toggle input');
      toggle.id = `${container.id}-${type}`;
      toggle.addEventListener('change', () => onChange(type, {enabled: toggle.checked}));
      const body = card.querySelector('.polyhedron-selection');
      const previous = card.querySelector('.previous');
      const next = card.querySelector('.next');
      for (const [button, delta] of [[previous, -1], [next, 1]]) {
        button.addEventListener('click', () => {
          const count = current.counts[type];
          if (count) onChange(type, {index: (current.settings[type].index + delta + count) % count});
        });
      }
      const all = card.querySelector('.all-sites input');
      all.id = `${container.id}-${type}-all`;
      const allText = card.querySelector('.all-sites span');
      all.addEventListener('change', () => onChange(type, {all: all.checked}));
      container.append(card);
      cards.push({type, name, toggle, body, previous, next, all, allText, position: card.querySelector('.site-position'), reserveSpace: container.id === 'interstitial-fullscreen'});
    }
  }
  return {
    update(state, labels) {
      current = state;
      for (const card of cards) {
        const setting = state.settings[card.type];
        const count = state.counts[card.type] ?? 0;
        card.name.textContent = labels[card.type];
        card.previous.title = labels.previous(card.type);
        card.next.title = labels.next(card.type);
        card.previous.setAttribute('aria-label', card.previous.title);
        card.next.setAttribute('aria-label', card.next.title);
        card.all.setAttribute('aria-label', labels.allLabel(card.type));
        card.allText.textContent = labels.all;
        card.toggle.checked = setting.enabled;
        card.toggle.disabled = state.busy;
        // Fullscreen controls must not resize the canvas when a type is toggled.
        card.body.hidden = !state.polyhedra || (!setting.enabled && !card.reserveSpace);
        card.body.style.visibility = setting.enabled ? '' : 'hidden';
        card.all.checked = setting.all;
        card.all.disabled = state.busy;
        card.previous.disabled = card.next.disabled = state.busy || setting.all || count < 2;
        card.position.textContent = labels.position(setting.index, count, setting.all);
      }
    }
  };
}
