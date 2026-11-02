// Preserve the existing canvas and model state in both native and browser-sized fullscreen.
export function setupFullscreen({panel, button, dialog, onChange, onExitError}) {
  let active = false;
  let pending = false;
  let placeholder = null;
  let scrollPosition;
  let previousFocus;

  function update(next) {
    if (active === next) return;
    active = next;
    panel.classList.toggle('is-fullscreen', active);
    document.body.classList.toggle('has-fullscreen-viewer', active);
    button.setAttribute('aria-pressed', String(active));
    onChange(active);
    if (!active && previousFocus?.isConnected) previousFocus.focus({preventScroll: true});
  }

  function openFallback() {
    // Keep the page's height and scroll position while the same viewer is in a modal.
    scrollPosition = {left: window.scrollX, top: window.scrollY};
    placeholder = document.createElement('div');
    placeholder.style.height = `${panel.getBoundingClientRect().height}px`;
    placeholder.setAttribute('aria-hidden', 'true');
    panel.before(placeholder);
    dialog.append(panel);
    update(true);
    dialog.showModal();
    button.focus({preventScroll: true});
  }

  dialog.addEventListener('close', () => {
    if (!placeholder) return;
    placeholder.replaceWith(panel);
    placeholder = null;
    update(false);
    window.scrollTo({...scrollPosition, behavior: 'instant'});
  });

  document.addEventListener('fullscreenchange', () => {
    if (!dialog.open) update(document.fullscreenElement === panel);
  });

  panel.addEventListener('keydown', event => {
    if (event.key === 'Escape' && document.fullscreenElement === panel && !pending) {
      event.preventDefault();
      button.click();
    }
  });

  button.addEventListener('click', async () => {
    if (pending) return;
    pending = true;
    button.disabled = true;
    try {
      if (dialog.open) {
        dialog.close();
      } else if (document.fullscreenElement === panel) {
        try { await document.exitFullscreen(); }
        catch { onExitError(); }
      } else {
        previousFocus = button;
        if (panel.requestFullscreen && document.fullscreenEnabled) {
          try {
            await panel.requestFullscreen();
            update(document.fullscreenElement === panel);
            return;
          } catch {
            // Embedded browsers and some mobile browsers cannot enter native fullscreen.
          }
        }
        openFallback();
      }
    } finally {
      pending = false;
      button.disabled = false;
      button.focus({preventScroll: true});
    }
  });
}
