/* Melhorias progressivas: os formulários continuam funcionando sem JavaScript. */
(() => {
  'use strict';

  const comentario = document.querySelector('textarea[name="comentario"]');
  const counter = document.querySelector('[data-character-count]');
  if (comentario && counter) {
    const helpIds = ['comentario-ajuda'];
    if (document.getElementById('comentario-erros')) {
      helpIds.push('comentario-erros');
      comentario.setAttribute('aria-invalid', 'true');
    }
    const describedBy = new Set([
      ...(comentario.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean),
      ...helpIds,
    ]);
    comentario.setAttribute('aria-describedby', [...describedBy].join(' '));
    const updateCount = () => {
      const length = Array.from(comentario.value).length;
      const limit = comentario.maxLength > 0 ? comentario.maxLength : 1000;
      counter.textContent = `${length.toLocaleString('pt-BR')} / ${limit.toLocaleString('pt-BR')}`;
    };
    counter.hidden = false;
    comentario.addEventListener('input', updateCount);
    updateCount();
  }

  document.querySelectorAll('[data-loading-form]').forEach((form) => {
    const button = form.querySelector('[data-submit-button]');
    const status = form.querySelector('[data-submit-status]');
    if (!button) return;
    const originalLabel = button.innerHTML;
    form.addEventListener('submit', (event) => {
      if (form.dataset.submitting === 'true') {
        event.preventDefault();
        return;
      }
      form.dataset.submitting = 'true';
      button.disabled = true;
      button.textContent = button.dataset.loadingLabel || 'Enviando…';
      form.setAttribute('aria-busy', 'true');
      if (status) status.hidden = false;
    });
    // Restaura o formulário ao voltar pelo histórico do navegador (bfcache).
    window.addEventListener('pageshow', () => {
      delete form.dataset.submitting;
      button.disabled = false;
      button.innerHTML = originalLabel;
      form.removeAttribute('aria-busy');
      if (status) status.hidden = true;
      if (comentario) comentario.dispatchEvent(new Event('input'));
    });
  });
})();
