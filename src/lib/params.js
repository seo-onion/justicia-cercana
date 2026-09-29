const q = new URLSearchParams(typeof location === 'undefined' ? '' : location.search)

const leer = (k, d = null) => (q.has(k) ? q.get(k) : d)

export const params = {
  demo: leer('demo') === '1',
  reset: leer('reset') === '1',
  seed: leer('seed', 'base'),
  today: leer('today', '2026-05-12'),
  net: leer('net'),
  scenario: leer('scenario', 'sync-ok'),
  freeze: leer('freeze') === '1',
  annotate: leer('annotate') === '1',
  battery: leer('battery') === null ? null : Number(leer('battery')),
  font: leer('font'),
  pin: leer('pin'),
  modo: leer('modo'),
  intro: leer('intro')
}

export const con = (extra = {}) => {
  const n = new URLSearchParams(q)
  for (const [k, v] of Object.entries(extra)) {
    if (v === null) n.delete(k)
    else n.set(k, String(v))
  }
  const s = n.toString()
  return s ? `?${s}` : ''
}
