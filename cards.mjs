function element(tag, value) {
  const node = document.createElement(tag);
  node.textContent = value;
  return node;
}

export function card(record, edit, remove) {
  const article = element('article', '');
  article.className = 'card';
  article.append(element('small', [record.scope, record.period].filter(Boolean).join(' · ')),
    element('h4', record.title), element('p', record.detail));
  if (record.facts) article.append(element('p', record.facts));
  const actions = element('div', '');
  actions.className = 'actions';
  const source = element('a', 'Ver fuente ↗');
  source.href = record.source;
  source.target = '_blank';
  source.rel = 'noopener noreferrer';
  actions.append(source);
  if (edit) {
    for (const [label, action] of [['Editar', edit], ['Eliminar', remove]]) {
      const button = element('button', label);
      button.addEventListener('click', () => action(record));
      actions.append(button);
    }
  }
  article.append(actions);
  return article;
}
