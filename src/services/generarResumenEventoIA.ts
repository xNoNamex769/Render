import { ResumenEventoIA } from '../models/ResumenEventoIA';
import { RelUsuarioEvento } from '../models/RelUsuarioEvento';
import { Usuario } from '../models/Usuario';
import { Aprendiz } from '../models/Aprendiz';
import { RolUsuario } from '../models/RolUsuario';
import { Asistencia } from '../models/Asistencia';
import { Actividad } from '../models/Actividad';
import { Evento } from '../models/Evento';

export async function generarResumenEventoIA(IdActividad: number, IdEvento: number) {
const inscritos = await RelUsuarioEvento.findAll({
  where: { IdEvento },
  include: [
    {
      model: Usuario,
      include: [
        {
          model: Aprendiz, // relación directa
          required: false,
        },
        {
          model: RolUsuario,
          as: 'rol',
          where: { NombreRol: 'Aprendiz' }, //  mejor filtrar por nombre
          required: true,
        },
      ],
    },
  ],
});


  const totalInscritos = inscritos.length;

  const asistenciasCompletas = await Asistencia.findAll({ where: { IdActividad } });
  const asistenciasValidas = asistenciasCompletas.filter(
    (a) => a.QREntrada !== null && a.QRSalida !== null
  );

  const asistentesIds = new Set(asistenciasValidas.map((a) => a.IdUsuario));
  const asistentes = inscritos.filter((rel) => asistentesIds.has(rel.IdUsuario));
  const totalAsistentes = asistentes.length;

  const porcentaje = totalInscritos > 0 ? (totalAsistentes / totalInscritos) * 100 : 0;

  const fichas: Record<string, number> = {};
  const jornadas: Record<string, number> = {};

  for (const rel of asistentes as any[]) {
    const aprendiz = rel.Usuario?.Aprendiz;
    const ficha = aprendiz?.Ficha ?? 'Desconocida';
    const jornada = aprendiz?.Jornada ?? 'No definida';

    fichas[ficha] = (fichas[ficha] || 0) + 1;
    jornadas[jornada] = (jornadas[jornada] || 0) + 1;
  }

  const fichaMayorParticipacion = Object.entries(fichas).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
  // Buscar el programa formativo de la ficha destacada
const fichaDestacada = await Aprendiz.findOne({
  where: { Ficha: fichaMayorParticipacion }
});
const programaFichaDestacada = fichaDestacada?.ProgramaFormacion || 'Programa no encontrado';

  const jornadaDestacada = Object.entries(jornadas).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
  const resumenIA = `Participación del ${porcentaje.toFixed(1)}%. Mayor asistencia en ficha ${fichaMayorParticipacion} y jornada ${jornadaDestacada}.`;

  const resumenGuardado = await ResumenEventoIA.create({
    IdActividad,
    IdEvento,
    totalInscritos,
    totalAsistentes,
    porcentajeParticipacion: porcentaje,
    fichaMayorParticipacion,
    jornadaDestacada,

    resumenIA,
  });
  const detalleAsistentes = asistentes.map((rel) => {
  const usuario = rel.Usuario;

 const aprendiz = usuario?.aprendiz;



  return {
    nombre: `${usuario?.Nombre} ${usuario?.Apellido}`,
    ficha: aprendiz?.Ficha || 'Desconocida',
    jornada: aprendiz?.Jornada || 'No definida',
    programa: aprendiz?.ProgramaFormacion || 'No registrado'
  };
});


  // 🧠 ¡Aquí lo importante! Cargar actividad y evento con nombres:
  const resumenConDatos = await ResumenEventoIA.findByPk(resumenGuardado.id, {
    include: [
      { model: Actividad, attributes: ['NombreActi'] },
      { model: Evento, attributes: ['NombreEvento'] }
    ]
  });

 return {
  ok: true,
  mensaje: 'Resumen generado exitosamente.',
  resumen: {
    ...resumenGuardado.toJSON(),
    Actividad: {
      NombreActi: resumenConDatos?.Actividad?.NombreActi || 'Sin nombre'
    },
    Evento: {
      NombreEvento: resumenConDatos?.Evento?.NombreEvento || 'Sin nombre'
    },
     fichaDestacadaPrograma: programaFichaDestacada,
    detalleAsistentes
  }
};
}