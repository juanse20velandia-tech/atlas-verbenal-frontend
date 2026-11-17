const get = id => document.getElementById(id);
const dialog = get('dialog');
const form = get('form');
const fields = get('fields');
let submitAction;

function open(title, content, action) {
  get('dialog-title').textContent = title;
  get('form-error').textContent = '';
  fields.replaceChildren(content);
  submitAction = action;
  dialog.showModal();
}

export function askKey(action) {
  const label = document.createElement('label');
  label.textContent = 'Clave de edición';
  const input = document.createElement('input');
  input.type = 'password';
  input.required = true;
  input.name = 'key';
  input.autocomplete = 'current-password';
  label.append(input);
  open('Acceso de edición', label, values => action(values.key));
}

export function editRecord(record, action) {
  const fragment = get('edit-fields').content.cloneNode(true);
  for (const input of fragment.querySelectorAll('[name]')) {
    if (!record) continue;
    input.value = input.name === 'geometry'
      ? record.geometry ? JSON.stringify(record.geometry) : ''
      : record[input.name] ?? '';
  }
  open(record ? 'Editar ficha' : 'Nueva ficha', fragment, values => {
    if (values.geometry.trim()) {
      try { values.geometry = JSON.parse(values.geometry); }
      catch { throw new Error('Escribe una geometría GeoJSON válida.'); }
    } else values.geometry = null;
    return action(values);
  });
}

get('close').onclick = () => dialog.close();
form.onsubmit = async event => {
  event.preventDefault();
  const button = form.querySelector('[type="submit"]');
  button.disabled = true;
  try {
    await submitAction(Object.fromEntries(new FormData(form)));
    dialog.close();
  } catch (error) {
    get('form-error').textContent = error.message;
  } finally {
    button.disabled = false;
  }
};
