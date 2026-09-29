import { marcarRegistro } from './reglas.js'

const P = (nombre, rol, comunidad, extra = {}) => ({
  id: `p-${nombre.split(' ')[0].toLowerCase()}-${comunidad.slice(0, 3).toLowerCase()}`,
  nombre,
  rol,
  comunidad,
  tipoDoc: extra.tipoDoc || 'no-mano',
  numDoc: extra.numDoc || '',
  telefono: extra.telefono || '',
  sinTelefono: !extra.telefono,
  direccion: extra.direccion || ''
})

const CASOS = [
  {
    id: 'c-0009',
    codigo: 'JZ04-TAB01-202604-0009',
    fechaRegistro: '2026-04-18',
    tipoConflicto: 'alimentos',
    tipoConflictoOtro: '',
    descripcion: 'La senora pide que el padre de sus dos hijos cumpla con el aporte mensual que habian acordado de palabra.',
    estado: 'tramite',
    resultado: '',
    observaciones: '',
    proximaFecha: '',
    personas: [
      P('Rosa Ayala Quispe', 'Solicitante', 'Vicco', { tipoDoc: 'dni', numDoc: '40218765', telefono: '963471208' }),
      P('Teofilo Ramos Lazo', 'Invitado', 'Vicco')
    ],
    avances: [
      { id: 'av-1', fecha: '2026-04-20', queSeHizo: 'Se cito a las dos partes. Solo asistio la solicitante.', nuevoEstado: '', proximaFecha: '', resultado: '', evidencias: [] }
    ],
    creadoEn: '2026-04-18T09:10',
    actualizadoEn: '2026-04-20T11:30'
  },
  {
    id: 'c-0010',
    codigo: 'JZ04-TAB01-202605-0010',
    fechaRegistro: '2026-05-02',
    tipoConflicto: 'vecinos',
    tipoConflictoOtro: '',
    descripcion: 'Dos vecinos discuten por el paso de agua de riego hacia la chacra de abajo. Uno cerro la acequia.',
    estado: 'conciliacion',
    resultado: '',
    observaciones: 'Las partes aceptan conversar.',
    proximaFecha: '2026-05-08T09:00',
    personas: [
      P('Feliciano Quispe Ccama', 'Solicitante', 'Huayllay', { tipoDoc: 'dni', numDoc: '41320987', telefono: '951208734' }),
      P('Delia Huaman Soto', 'Invitado', 'Huayllay', { tipoDoc: 'dni', numDoc: '42877610' })
    ],
    avances: [
      { id: 'av-2', fecha: '2026-05-03', queSeHizo: 'Se escucho a las dos partes por separado. Aceptan reunirse.', nuevoEstado: 'conciliacion', proximaFecha: '2026-05-08T09:00', resultado: '', evidencias: [{ tipo: 'fisica', valor: 'Acta en cuaderno 3, folio 12' }] }
    ],
    creadoEn: '2026-05-02T10:00',
    actualizadoEn: '2026-05-03T12:20'
  },
  {
    id: 'c-0011',
    codigo: 'JZ04-TAB01-202605-0011',
    fechaRegistro: '2026-05-06',
    tipoConflicto: 'deudas',
    tipoConflictoOtro: '',
    descripcion: 'Prestamo de 800 soles para la compra de semilla que no se devolvio en la fecha acordada.',
    estado: 'tramite',
    resultado: '',
    observaciones: '',
    proximaFecha: '2026-05-12T11:00',
    personas: [
      P('Marcelina Poma Yupanqui', 'Solicitante', 'Ninacaca', { tipoDoc: 'dni', numDoc: '43509182', telefono: '974310562' }),
      P('Aurelio Vega Pariona', 'Invitado', 'Ninacaca', { telefono: '918203745' })
    ],
    avances: [
      { id: 'av-3', fecha: '2026-05-07', queSeHizo: 'Se notifico al invitado en su domicilio.', nuevoEstado: '', proximaFecha: '2026-05-12T11:00', resultado: '', evidencias: [] }
    ],
    creadoEn: '2026-05-06T08:40',
    actualizadoEn: '2026-05-07T09:15'
  },
  {
    id: 'c-0012',
    codigo: 'JZ04-TAB01-202605-0012',
    fechaRegistro: '2026-05-04',
    tipoConflicto: 'danos',
    tipoConflictoOtro: '',
    descripcion: 'Un rebano entro a la parcela de papa del vecino y comio parte del sembrio.',
    estado: 'concluido',
    resultado: 'Las partes acordaron el pago de 250 soles en dos partes y arreglar la cerca. Se firmo el acta.',
    observaciones: '',
    proximaFecha: '',
    personas: [
      P('Juana Sinche Lopez', 'Solicitante', 'Carhuamayo', { tipoDoc: 'dni', numDoc: '44760215', telefono: '930518264' }),
      P('Nestor Cahuana Ruiz', 'Invitado', 'Carhuamayo', { tipoDoc: 'dni', numDoc: '45118307' })
    ],
    avances: [
      { id: 'av-4', fecha: '2026-05-09', queSeHizo: 'Se reunieron las dos partes y llegaron a un acuerdo de pago.', nuevoEstado: 'concluido', proximaFecha: '', resultado: 'Pago de 250 soles en dos partes y arreglo de la cerca.', evidencias: [{ tipo: 'foto', valor: 'Foto del acta firmada' }] }
    ],
    creadoEn: '2026-05-04T15:20',
    actualizadoEn: '2026-05-09T17:05'
  },
  {
    id: 'c-0008',
    codigo: 'JZ04-TAB01-202604-0008',
    fechaRegistro: '2026-04-28',
    tipoConflicto: 'peleas',
    tipoConflictoOtro: '',
    descripcion: 'Discusion con insultos en la faena comunal. Piden que se registre por si vuelve a pasar.',
    estado: 'tramite',
    resultado: '',
    observaciones: '',
    proximaFecha: '',
    personas: [],
    avances: [],
    creadoEn: '2026-04-28T16:00',
    actualizadoEn: '2026-04-28T16:00'
  }
]

const ACTUACIONES = [
  {
    id: 'a-0003',
    codigo: 'NOT-TAB01-202605-0003',
    fechaSolicitud: '2026-05-11',
    tipo: 'firma',
    tipoOtro: '',
    descripcion: 'Necesita que se certifique su firma en una carta dirigida a la municipalidad.',
    estadoAtencion: 'pendiente',
    fechaAtencion: '',
    resultado: '',
    fechaEntrega: '',
    observaciones: '',
    documentos: [],
    personas: [P('Maria Condori Huaman', 'Solicitante', 'Huayllay', { telefono: '942710385' })],
    creadoEn: '2026-05-11T10:30',
    actualizadoEn: '2026-05-11T10:30'
  },
  {
    id: 'a-0004',
    codigo: 'NOT-TAB01-202605-0004',
    fechaSolicitud: '2026-05-07',
    tipo: 'domicilio',
    tipoOtro: '',
    descripcion: 'Pide una constancia de que vive en Vicco para un tramite en el banco.',
    estadoAtencion: 'atendida',
    fechaAtencion: '2026-05-08',
    resultado: '',
    fechaEntrega: '',
    observaciones: 'Falta que pase a recoger el documento.',
    documentos: [{ tipo: 'fisica', valor: 'Solicitud en cuaderno 4, folio 3' }],
    personas: [P('Gregorio Astete Nina', 'Solicitante', 'Vicco', { tipoDoc: 'dni', numDoc: '44120398', telefono: '956102478' })],
    creadoEn: '2026-05-07T11:15',
    actualizadoEn: '2026-05-08T09:40'
  },
  {
    id: 'a-0005',
    codigo: 'NOT-TAB01-202605-0005',
    fechaSolicitud: '2026-05-04',
    tipo: 'copia',
    tipoOtro: '',
    descripcion: 'Certificar la copia del titulo de su terreno para presentarlo en la agencia agraria.',
    estadoAtencion: 'concluida',
    fechaAtencion: '2026-05-05',
    resultado: 'Se entrego la copia certificada del titulo, con sello y firma del juzgado.',
    fechaEntrega: '2026-05-06',
    observaciones: '',
    documentos: [{ tipo: 'foto', valor: 'Foto de la copia sellada' }],
    personas: [P('Nelly Chuquipiondo Vera', 'Solicitante', 'Carhuamayo', { tipoDoc: 'dni', numDoc: '45903127' })],
    creadoEn: '2026-05-04T09:05',
    actualizadoEn: '2026-05-06T16:20'
  },
  {
    id: 'a-0006',
    codigo: 'NOT-TAB01-202605-0006',
    fechaSolicitud: '2026-05-12',
    tipo: 'convivencia',
    tipoOtro: '',
    descripcion: '',
    estadoAtencion: 'pendiente',
    fechaAtencion: '',
    resultado: '',
    fechaEntrega: '',
    observaciones: '',
    documentos: [],
    personas: [P('Hilario Pucllas Mamani', 'Solicitante', 'Ninacaca')],
    creadoEn: '2026-05-12T08:55',
    actualizadoEn: '2026-05-12T08:55'
  }
]

const ACTIVIDADES = [
  { id: 't-01', titulo: 'Audiencia de conciliacion', categoria: 'audiencia', fecha: '2026-05-08', horaInicio: '09:00', horaFin: '10:00', sinHoraFija: false, lugar: 'Huayllay', descripcion: 'Primera reunion por el paso de agua.', estado: 'realizada', vinculo: { tipo: 'caso', id: 'c-0010', codigo: 'JZ04-TAB01-202605-0010' }, recordatorio: '1-dia', creadaDesdeCaso: true },
  { id: 't-02', titulo: 'Audiencia de conciliacion', categoria: 'audiencia', fecha: '2026-05-11', horaInicio: '09:00', horaFin: '10:00', sinHoraFija: false, lugar: 'Huayllay', descripcion: '', estado: 'realizada', vinculo: null, recordatorio: '1-dia', creadaDesdeCaso: false },
  { id: 't-03', titulo: 'Audiencia por deuda de semilla', categoria: 'audiencia', fecha: '2026-05-12', horaInicio: '11:00', horaFin: '12:00', sinHoraFija: false, lugar: 'Huayllay', descripcion: 'Citadas las dos partes del caso de la deuda.', estado: 'programada', vinculo: { tipo: 'caso', id: 'c-0011', codigo: 'JZ04-TAB01-202605-0011' }, recordatorio: '1-dia', creadaDesdeCaso: true },
  { id: 't-04', titulo: 'Visita a Vicco', categoria: 'visita', fecha: '2026-05-12', horaInicio: '', horaFin: '', sinHoraFija: true, lugar: 'Vicco', descripcion: '', estado: 'cancelada', vinculo: null, recordatorio: 'no', creadaDesdeCaso: false },
  { id: 't-05', titulo: 'Reunion con la junta de regantes', categoria: 'reunion', fecha: '2026-05-13', horaInicio: '10:00', horaFin: '11:00', sinHoraFija: false, lugar: 'Ninacaca', descripcion: 'Ver el reparto de agua de la temporada.', estado: 'programada', vinculo: null, recordatorio: '1-dia', creadaDesdeCaso: false },
  { id: 't-06', titulo: 'Visita a San Pedro de Racco', categoria: 'visita', fecha: '2026-05-13', horaInicio: '15:00', horaFin: '16:30', sinHoraFija: false, lugar: 'San Pedro de Racco', descripcion: 'Notificar a dos personas del caso de alimentos.', estado: 'programada', vinculo: { tipo: 'caso', id: 'c-0009', codigo: 'JZ04-TAB01-202604-0009' }, recordatorio: 'mismo-dia', creadaDesdeCaso: false },
  { id: 't-07', titulo: 'Visita a Huayllay', categoria: 'visita', fecha: '2026-05-14', horaInicio: '15:00', horaFin: '16:00', sinHoraFija: false, lugar: 'Huayllay', descripcion: 'Entregar dos constancias en la comunidad.', estado: 'programada', vinculo: null, recordatorio: '1-dia', creadaDesdeCaso: false },
  { id: 't-08', titulo: 'Audiencia por alimentos', categoria: 'audiencia', fecha: '2026-05-15', horaInicio: '09:30', horaFin: '10:30', sinHoraFija: false, lugar: 'Vicco', descripcion: '', estado: 'programada', vinculo: { tipo: 'caso', id: 'c-0009', codigo: 'JZ04-TAB01-202604-0009' }, recordatorio: '1-dia', creadaDesdeCaso: true },
  { id: 't-09', titulo: 'Entrega de constancia', categoria: 'otra', fecha: '2026-05-16', horaInicio: '', horaFin: '', sinHoraFija: true, lugar: 'Carhuamayo', descripcion: '', estado: 'programada', vinculo: { tipo: 'actuacion', id: 'a-0004', codigo: 'NOT-TAB01-202605-0004' }, recordatorio: 'no', creadaDesdeCaso: false },
  { id: 't-10', titulo: 'Reunion de jueces de paz de la provincia', categoria: 'reunion', fecha: '2026-05-20', horaInicio: '10:00', horaFin: '12:00', sinHoraFija: false, lugar: 'Vicco', descripcion: '', estado: 'programada', vinculo: null, recordatorio: '1-dia', creadaDesdeCaso: false },
  { id: 't-11', titulo: 'Visita por el caso de la cerca', categoria: 'visita', fecha: '2026-05-18', horaInicio: '', horaFin: '', sinHoraFija: true, lugar: '', descripcion: '', estado: 'programada', vinculo: null, recordatorio: '1-dia', creadaDesdeCaso: false }
]

const clon = (x) => JSON.parse(JSON.stringify(x))

const sellar = (tipo, lista, envio) => lista.map((r) => marcarRegistro(tipo, { ...clon(r), envio }))

export const VARIANTES = ['base', 'mixto', 'atrasado']

export const semilla = (nombre = 'base') => {
  const casos = sellar('caso', CASOS, 'enviado')
  const actuaciones = sellar('actuacion', ACTUACIONES, 'enviado')
  const actividades = sellar('actividad', ACTIVIDADES, 'enviado')

  const servidor = {
    casos: clon(casos).map((c) =>
      c.id === 'c-0010'
        ? { ...c, observaciones: 'Las partes aceptan conversar. Revisado en la sede: se confirma la audiencia del 19/05.', actualizadoEn: '2026-05-12T19:05', origen: 'computadora' }
        : c
    ),
    actuaciones: clon(actuaciones),
    actividades: clon(actividades),
    ultimoEnvioTableta: '2026-05-12T18:40'
  }

  const meta = {
    id: 'meta',
    pin: '1234',
    ultimoEnvio: '2026-05-12T18:40',
    introVista: true,
    tamanoLetra: 'normal',
    borrador: null,
    variante: nombre
  }

  if (nombre === 'mixto' || nombre === 'atrasado') {
    const c10 = casos.find((c) => c.id === 'c-0010')
    c10.envio = 'local'
    c10.observaciones = 'Las partes aceptan conversar. La acequia sigue cerrada.'
    c10.actualizadoEn = '2026-05-12T18:50'
    casos.find((c) => c.id === 'c-0011').envio = 'local'
    actuaciones.find((a) => a.id === 'a-0006').envio = 'local'
    actividades.find((t) => t.id === 't-11').envio = 'local'
    if (nombre === 'atrasado') meta.ultimoEnvio = '2026-05-07T17:20'
  }

  return { casos, actuaciones, actividades, meta, servidor }
}
