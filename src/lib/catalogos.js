export const CONFLICTOS = [
  { id: 'alimentos', etiqueta: 'Pensión de alimentos' },
  { id: 'deudas', etiqueta: 'Deudas y pagos' },
  { id: 'danos', etiqueta: 'Daños a cultivos, animales o cosas' },
  { id: 'vecinos', etiqueta: 'Problemas entre vecinos (paso, agua, ruidos, límites)' },
  { id: 'peleas', etiqueta: 'Insultos o peleas leves' },
  { id: 'otro', etiqueta: 'Otro (escribir cuál)' }
]

export const ACTUACIONES = [
  { id: 'firma', etiqueta: 'Certificar una firma', legal: 'Legalización de firma' },
  { id: 'copia', etiqueta: 'Certificar una copia de documento', legal: 'Copia certificada' },
  { id: 'domicilio', etiqueta: 'Constancia de que vive en un lugar', legal: 'Constancia domiciliaria' },
  { id: 'supervivencia', etiqueta: 'Constancia de que una persona sigue con vida', legal: 'Constancia de supervivencia' },
  { id: 'posesion', etiqueta: 'Constancia de que ocupa un terreno', legal: 'Constancia de posesión' },
  { id: 'convivencia', etiqueta: 'Constancia de que viven juntos', legal: 'Constancia de convivencia' },
  { id: 'transferencia', etiqueta: 'Documento de venta o traspaso de un bien', legal: 'Transferencia de bienes, dentro de los montos que permite la ley' },
  { id: 'otra', etiqueta: 'Otra (escribir cuál)', legal: '' }
]

export const ACTUACIONES_VISIBLES = 4

export const COMUNIDADES = ['Huayllay', 'San Pedro de Racco', 'Vicco', 'Ninacaca', 'Carhuamayo', 'Huachón']

export const DOCUMENTOS = [
  { id: 'dni', etiqueta: 'DNI' },
  { id: 'ce', etiqueta: 'Carné de extranjería' },
  { id: 'otro', etiqueta: 'Otro' },
  { id: 'no-tiene', etiqueta: 'No tiene' },
  { id: 'no-mano', etiqueta: 'No lo tiene a la mano' }
]

export const ROLES_CASO = ['Solicitante', 'Invitado', 'Testigo']
export const ROLES_ACTUACION = ['Solicitante', 'Declarante', 'Testigo']

export const ESTADOS_CASO = [
  { id: 'tramite', etiqueta: 'En trámite' },
  { id: 'conciliacion', etiqueta: 'En conciliación' },
  { id: 'concluido', etiqueta: 'Concluido' }
]

export const ESTADOS_ATENCION = [
  { id: 'pendiente', etiqueta: 'Pendiente', ayuda: 'la persona lo pidió, aún no se atiende' },
  { id: 'atendida', etiqueta: 'Atendida', ayuda: 'ya se atendió, falta entregar' },
  { id: 'concluida', etiqueta: 'Concluida', ayuda: 'ya se entregó' }
]

export const CATEGORIAS = [
  { id: 'audiencia', etiqueta: 'Audiencia', icono: 'Gavel', color: 'cat1' },
  { id: 'reunion', etiqueta: 'Reunión', icono: 'Users', color: 'cat2' },
  { id: 'visita', etiqueta: 'Visita a comunidad', icono: 'MapPin', color: 'cat3' },
  { id: 'otra', etiqueta: 'Otra', icono: 'Calendar', color: 'cat4' }
]

export const ESTADOS_ACTIVIDAD = [
  { id: 'programada', etiqueta: 'Programada', icono: 'Clock', color: 'azul' },
  { id: 'realizada', etiqueta: 'Realizada', icono: 'CircleCheckBig', color: 'verde' },
  { id: 'cancelada', etiqueta: 'Cancelada', icono: 'CircleX', color: 'gris' }
]

export const SUGERENCIAS_ACTIVIDAD = [
  'Audiencia de conciliación',
  'Visita a la comunidad',
  'Reunión con autoridades comunales',
  'Entrega de constancia'
]

export const DIAS_SIN_AVANCE = 15
export const DIAS_SIN_ENVIAR = 3

export const et = (lista, id) => lista.find((x) => x.id === id)?.etiqueta || ''
