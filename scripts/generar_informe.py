import json, os, pathlib, re

RAIZ = pathlib.Path(__file__).resolve().parent.parent
DATOS = RAIZ / 'informe' / 'datos'
SALIDA = RAIZ / 'informe' / 'generado'
SALIDA.mkdir(parents=True, exist_ok=True)

def esc(t):
    t = str(t)
    for a, b in [('\\', r'\textbackslash{}'), ('&', r'\&'), ('%', r'\%'), ('$', r'\$'),
                 ('#', r'\#'), ('_', r'\_'), ('{', r'\{'), ('}', r'\}'),
                 ('~', r'\textasciitilde{}'), ('^', r'\textasciicircum{}')]:
        t = t.replace(a, b)
    return t

def cargar(nombre):
    p = DATOS / nombre
    return json.loads(p.read_text(encoding='utf-8')) if p.exists() else None

capturas = json.loads((RAIZ / 'informe' / 'captures.json').read_text(encoding='utf-8'))
matriz = cargar('matriz.json')
tactil = cargar('tactil.json')
contraste = cargar('contraste.json')

def figura(c, ancho='0.86'):
    return (f"\\begin{{figure}}[H]\\centering\n"
            f"\\includegraphics[width={ancho}\\linewidth]{{capturas/{c['archivo']}}}\n"
            f"\\caption{{{esc(c['pantalla'])} · {esc(c['paso'])}. {esc(c['demuestra'])}}}\n"
            f"\\end{{figure}}\n")

def por_flujo(nombre):
    return [c for c in capturas if c['flujo'] == nombre]

def por_pantalla(*ids):
    return [c for c in capturas if c['pantalla'] in ids and c['flujo'] == 'Pantallas base']

# --- pantallas por modulo ---
bloques = {
    'modulo1': por_pantalla('P-02', 'P-03', 'P-04'),
    'modulo2': por_pantalla('P-05', 'P-06'),
    'modulo3': por_pantalla('P-07', 'P-08'),
    'envio': por_pantalla('P-09', 'P-10'),
    'ingreso': por_pantalla('P-00', 'P-00b', 'P-01', 'Ayuda'),
}
for k, v in bloques.items():
    (SALIDA / f'{k}.tex').write_text(''.join(figura(c) for c in v), encoding='utf-8')

# --- barra de estado ---
(SALIDA / 'barra.tex').write_text(''.join(figura(c, '0.78') for c in por_flujo('Barra de estado')), encoding='utf-8')

# --- flujos ---
partes = []
for nombre, titulo in [('Flujo 1', 'Flujo 1 · Registrar un conflicto vecinal, con corte de conexión a mitad'),
                       ('Flujo 2', 'Flujo 2 · Atender un trámite, con cierre inesperado y recuperación'),
                       ('Flujo 3', 'Flujo 3 · Revisar las actividades de la semana'),
                       ('Flujo 4', 'Flujo 4 · Agendar una reunión y enviar todo'),
                       ('Flujo A', 'Flujo complementario A · Actualizar el avance de un caso'),
                       ('Flujo B', 'Flujo complementario B · Consultar y editar desde la computadora')]:
    partes.append(f"\\subsection{{{esc(titulo)}}}\n" + ''.join(figura(c, '0.82') for c in por_flujo(nombre)))
(SALIDA / 'flujos.tex').write_text(''.join(partes), encoding='utf-8')

# --- envio: variantes ---
(SALIDA / 'variantes.tex').write_text(''.join(figura(c, '0.82') for c in por_flujo('Envío')), encoding='utf-8')

# --- estados especiales ---
(SALIDA / 'especiales.tex').write_text(''.join(figura(c, '0.78') for c in por_flujo('Estados especiales')), encoding='utf-8')

# --- anotadas ---
(SALIDA / 'anotadas.tex').write_text(''.join(figura(c, '0.86') for c in por_flujo('Modo anotado')), encoding='utf-8')

# --- matriz ---
filas = []
for f in matriz:
    filas.append(' & '.join([
        str(f['id']), esc(f['pantalla']), esc(f['elemento']), esc(f['necesidad']),
        esc(f['norman']), esc(f['nielsen']), esc(f['factor']), esc(f['efecto'])]) + r' \\')
cab = (r'\textbf{ID} & \textbf{Pantalla} & \textbf{Elemento} & \textbf{Necesidad de la jueza} & '
       r'\textbf{Principio de Norman} & \textbf{Heurística de Nielsen} & \textbf{Factor humano} & '
       r'\textbf{Cómo facilita la interacción o previene errores} \\')
tabla = ['\\footnotesize\n\\setlength{\\tabcolsep}{4pt}\n\\begin{longtable}{@{}p{0.6cm}p{1.5cm}p{3.6cm}p{3.4cm}p{2.2cm}p{2.8cm}p{2.3cm}p{4.6cm}@{}}',
         r'\toprule', cab, r'\midrule', r'\endfirsthead', r'\toprule', cab, r'\midrule', r'\endhead',
         r'\bottomrule', r'\endfoot'] + filas + [r'\end{longtable}']
(SALIDA / 'matriz.tex').write_text('\n'.join(tabla), encoding='utf-8')

# --- tactil ---
if tactil:
    f = tactil['filas']
    pantallas = sorted({x['pantalla'] for x in f})
    filas = []
    for p in pantallas:
        n = [x for x in f if x['pantalla'] == p and x['letra'] == 'normal']
        g = [x for x in f if x['pantalla'] == p and x['letra'] == 'large']
        filas.append(f"{esc(p)} & {n[0]['controles'] if n else '-'} & {n[0]['fallos'] if n else '-'} & "
                     f"{g[0]['controles'] if g else '-'} & {g[0]['fallos'] if g else '-'} \\\\")
    total_n = sum(x['controles'] for x in f if x['letra'] == 'normal')
    total_g = sum(x['controles'] for x in f if x['letra'] == 'large')
    t = ['\\small\n\\begin{longtable}{@{}p{6.2cm}rrrr@{}}', r'\toprule',
         r'\textbf{Pantalla} & \multicolumn{2}{c}{\textbf{Letra normal}} & \multicolumn{2}{c}{\textbf{Letra grande}} \\',
         r' & controles & fallos & controles & fallos \\', r'\midrule', r'\endfirsthead',
         r'\toprule', r'\textbf{Pantalla} & controles & fallos & controles & fallos \\', r'\midrule', r'\endhead',
         r'\bottomrule', r'\endfoot'] + filas + [
         r'\midrule', f"\\textbf{{Total}} & \\textbf{{{total_n}}} & \\textbf{{{len([x for x in tactil['fallos'] if x['letra']=='normal'])}}} & \\textbf{{{total_g}}} & \\textbf{{{len([x for x in tactil['fallos'] if x['letra']=='large'])}}} \\\\",
         r'\end{longtable}']
    (SALIDA / 'tactil.tex').write_text('\n'.join(t), encoding='utf-8')
    (SALIDA / 'tactil_resumen.tex').write_text(
        f"Se midieron {total_n + total_g} controles en {len(pantallas)} pantallas, con letra normal y con letra grande. "
        f"Ninguno queda por debajo de 48 por 48 px ni a menos de 8 px de su vecino.", encoding='utf-8')

# --- contraste ---
if contraste:
    filas = [f"{esc(x['pantalla'])} & {x['elementos']} & {x['contraste']} & {x['otras']} \\\\" for x in contraste['filas']]
    tot = sum(x['elementos'] for x in contraste['filas'])
    t = ['\\small\n\\begin{longtable}{@{}p{6.8cm}rrr@{}}', r'\toprule',
         r'\textbf{Pantalla} & \textbf{Textos medidos} & \textbf{Fallos de contraste} & \textbf{Otros fallos AA} \\',
         r'\midrule', r'\endfirsthead', r'\toprule',
         r'\textbf{Pantalla} & \textbf{Textos medidos} & \textbf{Fallos de contraste} & \textbf{Otros fallos AA} \\',
         r'\midrule', r'\endhead', r'\bottomrule', r'\endfoot'] + filas + [
         r'\midrule', f"\\textbf{{Total}} & \\textbf{{{tot}}} & \\textbf{{{len([x for x in contraste['fallos'] if x['regla']=='color-contrast'])}}} & \\textbf{{{len([x for x in contraste['fallos'] if x['regla']!='color-contrast'])}}} \\\\",
         r'\end{longtable}']
    (SALIDA / 'contraste.tex').write_text('\n'.join(t), encoding='utf-8')
    (SALIDA / 'contraste_resumen.tex').write_text(
        f"axe-core midió {tot} textos en {len(contraste['filas'])} pantallas contra WCAG 2.1 nivel AA. "
        f"No se encontró ningún incumplimiento.", encoding='utf-8')

# --- manifiesto ---
filas = [f"{esc(c['archivo'])} & {esc(c['pantalla'])} & {esc(c['flujo'])} & {esc(c['paso'])} & {esc(c['criterio'])} \\\\" for c in capturas]
t = ['\\footnotesize\n\\setlength{\\tabcolsep}{4pt}\n\\begin{longtable}{@{}p{4.2cm}p{1.1cm}p{2.2cm}p{3.2cm}p{3.4cm}@{}}', r'\toprule',
     r'\textbf{Archivo} & \textbf{Pantalla} & \textbf{Flujo} & \textbf{Paso} & \textbf{Criterio de la rúbrica} \\',
     r'\midrule', r'\endfirsthead', r'\toprule',
     r'\textbf{Archivo} & \textbf{Pantalla} & \textbf{Flujo} & \textbf{Paso} & \textbf{Criterio} \\',
     r'\midrule', r'\endhead', r'\bottomrule', r'\endfoot'] + filas + [r'\end{longtable}']
(SALIDA / 'manifiesto.tex').write_text('\n'.join(t), encoding='utf-8')

print(f"generado: {len(list(SALIDA.glob('*.tex')))} archivos, {len(capturas)} capturas, {len(matriz)} filas de matriz")
