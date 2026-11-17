import { request } from './http.mjs';
import { showMap } from './map.mjs';
import { card } from './cards.mjs';
import { askKey, editRecord } from './dialog.mjs';

const get = id => document.getElementById(id);
let active;
let rows = [];
let boundaries = [];
let key = '';
let generation = 0;
const collection = () => 'records/' + active.id;
const showStatus = value => { get('status').textContent = value; };

function draw() {
  const search = get('search').value.toLocaleLowerCase('es-CO').trim();
  const matches = rows.filter(row => [row.title, row.detail, row.facts]
    .some(value => value?.toLocaleLowerCase('es-CO').includes(search)));
  get('records').replaceChildren(...matches.map(row => card(row,
    key && (item => editRecord(item, values => save(values, item))),
    key && remove)));
  showStatus(matches.length ? matches.length + (matches.length === 1 ? ' ficha' : ' fichas')
    : search ? 'No hay fichas que coincidan con la búsqueda.' : 'Esta capa aún no tiene datos verificados.');
  showMap(boundaries, matches);
}

async function load() {
  const ticket = ++generation;
  showStatus('Cargando fichas…');
  get('records').replaceChildren();
  try {
    const [next, limits] = await Promise.all([request(collection()), request('records/barrio')]);
    if (ticket !== generation) return;
    rows = next;
    boundaries = limits;
    draw();
  } catch (error) {
    if (ticket === generation) showStatus(error.message);
  }
}

function choose(category, button) {
  active = category;
  rows = [];
  for (const item of get('categories').children) {
    item.setAttribute('aria-pressed', String(item === button));
  }
  get('layer').textContent = category.label;
  get('hint').textContent = category.hint;
  get('new').hidden = !key;
  load();
}

async function save(value, item) {
  const path = item ? collection() + '/' + item.id : collection();
  await request(path, { method: item ? 'PUT' : 'POST', key, value, revision: item?.revision });
  await load();
}

async function remove(item) {
  if (!confirm('¿Eliminar la ficha «' + item.title + '»?')) return;
  try {
    await request(collection() + '/' + item.id, { method: 'DELETE', key, revision: item.revision });
    await load();
  } catch (error) {
    showStatus(error.message);
  }
}

get('search').oninput = draw;
get('new').onclick = () => editRecord(null, save);
get('editor').onclick = () => {
  if (key) {
    key = '';
    get('editor').textContent = 'Modo edición';
    get('new').hidden = true;
    draw();
    return;
  }
  askKey(async candidate => {
    await request('editor', { method: 'POST', key: candidate });
    key = candidate;
    get('editor').textContent = 'Salir de edición';
    get('new').hidden = !active;
    draw();
  });
};

try {
  const categories = await request('categories');
  for (const item of categories) {
    const button = document.createElement('button');
    button.textContent = item.label;
    button.onclick = () => choose(item, button);
    get('categories').append(button);
  }
  get('categories').children[categories.findIndex(item => item.id === 'barrio')]?.click();
} catch (error) {
  showStatus(error.message);
}
