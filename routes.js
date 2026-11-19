const sections = new Set(['courses', 'practice', 'incidents', 'review', 'handbook', 'settings']);

export function routePath(page, id) {
  if (page === 'module') return `#/courses/${encodeURIComponent(id)}`;
  if (page === 'incident') return `#/incidents/${encodeURIComponent(id)}`;
  if (page === 'training') return '#/practice/session';
  return page === 'home' ? '#/' : `#/${page}`;
}

export function readRoute(hash, { modules, incidents }) {
  const match = /^#\/([a-z]+)(?:\/([a-z0-9-]+))?$/.exec(hash);
  if (!match) return { page: 'home' };
  const [, section, id] = match;
  if (section === 'courses' && id) {
    return modules.some(module => module.id === id) ? { page: 'module', id } : { page: section };
  }
  if (section === 'incidents' && id) {
    return incidents.some(incident => incident.id === id) ? { page: 'incident', id } : { page: section };
  }
  if (section === 'practice' && id === 'session') return { page: 'training' };
  return { page: sections.has(section) ? section : 'home' };
}
