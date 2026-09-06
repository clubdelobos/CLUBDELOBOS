/**
 * Legal / policy documents for the Club de Lobos site. Written as plain,
 * adapted templates for an adventure-hiking club in El Salvador — they are a
 * solid starting point, not a substitute for review by a lawyer, especially
 * for the liability, payment and data-handling clauses.
 */

export interface LegalSection {
  heading: string;
  paragraphs?: string[];
  list?: string[];
}

export interface LegalDoc {
  slug: string;
  title: string;
  short: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}

const UPDATED = "1 de septiembre de 2026";
const BRAND = "Club de Lobos";
const CONTACT = "a través del formulario de contacto del sitio o por WhatsApp a los números publicados en el pie de página";

export const LEGAL_DOCS: LegalDoc[] = [
  {
    slug: "terminos",
    title: "Términos y Condiciones",
    short: "Términos y condiciones",
    updated: UPDATED,
    intro:
      `Estos Términos y Condiciones regulan el uso de este sitio web y la participación en las salidas, caminatas, viajes y experiencias organizadas por ${BRAND}. Al enviar una solicitud de reserva o participar en una actividad, la persona declara haber leído y aceptado estos términos.`,
    sections: [
      {
        heading: "1. Naturaleza del servicio",
        paragraphs: [
          `${BRAND} es un club de aventura que organiza y coordina actividades recreativas al aire libre —principalmente senderismo, camping y viajes de montaña— para sus participantes. ${BRAND} actúa como organizador y guía de grupo; cuando intervienen terceros (transporte, alimentación, hospedaje, ingreso a áreas naturales protegidas), estos prestan sus servicios bajo sus propias condiciones.`,
        ],
      },
      {
        heading: "2. Reservas y confirmación",
        list: [
          "El formulario del sitio genera una solicitud de reserva, no una reserva confirmada.",
          "El cupo queda confirmado únicamente cuando el equipo lo comunica de forma expresa y, si aplica, se recibe el pago o anticipo dentro del plazo indicado.",
          "Los cupos son limitados y se asignan por orden de confirmación de pago.",
          "La información de punto de encuentro, horario definitivo y recomendaciones se envía a las personas inscritas antes de la salida.",
        ],
      },
      {
        heading: "3. Precios y pagos",
        paragraphs: [
          "Los precios se informan por actividad e incluyen únicamente lo que se detalla en la descripción de cada salida. Cualquier gasto personal o servicio no listado corre por cuenta del participante. Los precios pueden actualizarse hasta el momento de la confirmación.",
        ],
      },
      {
        heading: "4. Responsabilidad del participante",
        list: [
          "Declarar con honestidad su estado de salud y condición física, y contar con la preparación que la actividad exige.",
          "Llevar el equipo y los artículos indicados para cada salida.",
          "Seguir en todo momento las indicaciones de los guías y las normas de las áreas visitadas.",
          "Respetar el entorno natural, a la comunidad local y al resto del grupo.",
          "Presentarse puntualmente; la salida no espera a quien no llega a la hora acordada.",
        ],
      },
      {
        heading: "5. Riesgos y exención de responsabilidad",
        paragraphs: [
          "Las actividades de montaña y naturaleza implican riesgos inherentes (terreno irregular, clima cambiante, altura, fauna, esfuerzo físico). El participante los asume voluntariamente. Dentro de lo permitido por la ley, ${BRAND}, sus guías y colaboradores no serán responsables por daños, lesiones o pérdidas derivados de caso fortuito, fuerza mayor, decisiones individuales del participante o del incumplimiento de las indicaciones de seguridad.".replace("${BRAND}", BRAND),
          "Se recomienda a cada participante contar con un seguro de accidentes o de asistencia en viaje vigente.",
        ],
      },
      {
        heading: "6. Cambios y cancelaciones por parte del club",
        paragraphs: [
          `${BRAND} puede modificar la ruta, el itinerario o la fecha, o cancelar una salida, por razones de seguridad, clima, condiciones del terreno, cupo mínimo no alcanzado o causas de fuerza mayor. En estos casos se aplica la Política de Cancelación.`,
        ],
      },
      {
        heading: "7. Menores de edad",
        paragraphs: [
          "La participación de menores de edad requiere autorización y acompañamiento de su madre, padre o representante legal, quien asume la responsabilidad sobre el menor durante toda la actividad.",
        ],
      },
      {
        heading: "8. Imagen y contenidos",
        paragraphs: [
          `Durante las salidas se toman fotografías y videos con fines de difusión del club. Quien no desee aparecer en este material puede indicarlo por escrito antes de la actividad. Los textos, marcas e imágenes del sitio son propiedad de ${BRAND} o de sus autores y no pueden reproducirse sin autorización.`,
        ],
      },
      {
        heading: "9. Uso del sitio",
        paragraphs: [
          "El sitio se ofrece “tal cual”. Se procura que la información sea correcta y esté actualizada, pero pueden existir errores u omisiones. No está permitido usar el sitio para fines ilícitos ni intentar afectar su funcionamiento o seguridad.",
        ],
      },
      {
        heading: "10. Ley aplicable y contacto",
        paragraphs: [
          `Estos términos se rigen por las leyes de la República de El Salvador. Cualquier consulta o reclamo puede dirigirse ${CONTACT}.`,
        ],
      },
    ],
  },
  {
    slug: "privacidad",
    title: "Política de Privacidad",
    short: "Política de privacidad",
    updated: UPDATED,
    intro:
      `En ${BRAND} tratamos los datos personales de forma responsable y con la única finalidad de gestionar la relación con quienes participan en nuestras actividades. Esta política explica qué datos recogemos, para qué y qué derechos tiene la persona titular.`,
    sections: [
      {
        heading: "1. Responsable del tratamiento",
        paragraphs: [
          `El responsable es ${BRAND}. Puede contactarnos ${CONTACT}.`,
        ],
      },
      {
        heading: "2. Datos que recogemos",
        list: [
          "Datos de contacto que la persona proporciona en el formulario de reserva: nombre, correo electrónico y teléfono.",
          "Datos de la solicitud: salida de interés, fecha deseada, número de personas y notas que decida incluir.",
          "Datos técnicos anónimos de navegación (páginas vistas, país aproximado y tipo de dispositivo) para entender el uso del sitio. No se almacena la dirección IP ni ubicación precisa.",
        ],
      },
      {
        heading: "3. Finalidad y base legal",
        list: [
          "Responder solicitudes y coordinar la participación en las salidas (ejecución de la relación solicitada por la persona).",
          "Enviar información logística de la actividad reservada.",
          "Mantener un registro interno de reservas y mejorar el servicio.",
          "Elaborar estadísticas agregadas de uso del sitio (interés legítimo).",
        ],
      },
      {
        heading: "4. Con quién compartimos datos",
        paragraphs: [
          "No vendemos ni cedemos datos personales. Solo se comparten los datos mínimos necesarios con proveedores que hacen posible el servicio (por ejemplo, alojamiento del sitio y base de datos) y, cuando corresponda, con autoridades de áreas naturales protegidas que exijan un listado de participantes.",
        ],
      },
      {
        heading: "5. Conservación",
        paragraphs: [
          "Los datos de una solicitud se conservan mientras exista relación con la persona y, después, el tiempo necesario para atender obligaciones legales o reclamaciones. Los datos analíticos se conservan de forma agregada.",
        ],
      },
      {
        heading: "6. Derechos de la persona titular",
        paragraphs: [
          `Toda persona puede solicitar acceder a sus datos, corregirlos, eliminarlos u oponerse a su tratamiento escribiéndonos ${CONTACT}. Atenderemos la solicitud en un plazo razonable.`,
        ],
      },
      {
        heading: "7. Seguridad",
        paragraphs: [
          "Aplicamos medidas técnicas y organizativas razonables para proteger los datos frente a accesos no autorizados, pérdida o alteración. El acceso interno está limitado al personal que administra el club.",
        ],
      },
      {
        heading: "8. Cambios",
        paragraphs: [
          "Esta política puede actualizarse. La versión vigente es siempre la publicada en esta página, con su fecha de última actualización.",
        ],
      },
    ],
  },
  {
    slug: "cancelacion",
    title: "Política de Cancelación y Reembolsos",
    short: "Política de cancelación",
    updated: UPDATED,
    intro:
      "Esta política aplica a las salidas y experiencias con cupo confirmado. Los plazos se cuentan a partir de la hora de inicio prevista de la actividad.",
    sections: [
      {
        heading: "1. Cancelación por parte del participante",
        list: [
          "Con más de 7 días de antelación: se reembolsa el 100 % de lo pagado, o se puede trasladar el cupo a otra salida dentro de los 3 meses siguientes.",
          "Entre 7 y 3 días de antelación: se retiene el 50 % en concepto de gastos de organización ya comprometidos; el resto se reembolsa o se convierte en crédito para otra salida.",
          "Con menos de 72 horas de antelación o no presentarse: no hay reembolso, ya que los costos del grupo (transporte, permisos, logística) están comprometidos.",
        ],
      },
      {
        heading: "2. Traslado de cupo a otra persona",
        paragraphs: [
          "Hasta 48 horas antes de la salida, el cupo puede cederse a otra persona sin costo, siempre que cumpla los requisitos de la actividad y lo comuniques por escrito. La persona que ingresa acepta los términos y la exención de responsabilidad.",
        ],
      },
      {
        heading: "3. Cancelación o cambio por parte del club",
        list: [
          "Si el club cancela por clima, seguridad, condiciones del terreno o fuerza mayor: se reembolsa el 100 %, o se ofrece reprogramación sin costo.",
          "Si no se alcanza el cupo mínimo: se avisa con al menos 48 horas de antelación y se reembolsa el 100 % o se reprograma.",
          "Si durante la actividad hay que suspender o acortar la ruta por seguridad: no se generan reembolsos, ya que la logística se ejecutó; se busca una alternativa cuando es posible.",
        ],
      },
      {
        heading: "4. Retrasos y punto de encuentro",
        paragraphs: [
          "La salida parte a la hora acordada. Quien llega tarde y pierde el transporte no tiene derecho a reembolso. Recomendamos llegar al menos 15 minutos antes.",
        ],
      },
      {
        heading: "5. Cómo solicitar una cancelación o reembolso",
        paragraphs: [
          `La solicitud debe hacerse por escrito ${CONTACT}, indicando la salida, la fecha y el motivo. Los reembolsos aprobados se procesan por el mismo medio de pago cuando es posible, en un plazo razonable.`,
        ],
      },
    ],
  },
  {
    slug: "bioseguridad",
    title: "Protocolos de Bioseguridad",
    short: "Protocolos de bioseguridad",
    updated: UPDATED,
    intro:
      "Estas medidas buscan cuidar la salud del grupo, de las comunidades que visitamos y del entorno natural. Pueden ajustarse según las disposiciones sanitarias vigentes y las condiciones de cada destino.",
    sections: [
      {
        heading: "1. Antes de la salida",
        list: [
          "No participes si tienes síntomas de una enfermedad transmisible (fiebre, tos, malestar general) el día de la actividad; escríbenos para reprogramar tu cupo.",
          "Informa con antelación cualquier condición de salud, alergia o tratamiento relevante para la actividad.",
          "Lleva tu propio kit personal: agua suficiente, hidratación, protección solar, repelente y los medicamentos que necesites.",
        ],
      },
      {
        heading: "2. Durante la actividad",
        list: [
          "Cada participante usa su propio equipo, botella y utensilios; no se comparten alimentos ni bebidas sin empaque individual.",
          "Mantén higiene de manos con agua y jabón o gel antes de comer y después de usar servicios.",
          "Sigue las indicaciones del guía sobre distancia, ritmo y puntos de descanso.",
          "Ante cualquier signo de agotamiento, mareo, deshidratación o lesión, avisa de inmediato al guía.",
        ],
      },
      {
        heading: "3. Botiquín y primeros auxilios",
        paragraphs: [
          "El club lleva un botiquín de grupo para atención básica y al menos un guía con formación en primeros auxilios. El botiquín no sustituye la atención médica profesional ni los medicamentos personales de cada participante.",
        ],
      },
      {
        heading: "4. Cuidado del entorno y las comunidades",
        list: [
          "Aplicamos el principio de “no dejar rastro”: todo lo que entra al sendero, sale con nosotros.",
          "Respetamos la señalización, la flora y la fauna; no se recolectan plantas, rocas ni se alimenta a los animales.",
          "Seguimos las normas de ingreso y aforo de las áreas naturales protegidas.",
        ],
      },
      {
        heading: "5. Emergencias",
        paragraphs: [
          "En caso de emergencia, el guía coordina la evacuación y el contacto con los servicios de rescate o salud correspondientes. Los costos de una atención médica externa o traslado especializado corren por cuenta del participante o de su seguro.",
        ],
      },
    ],
  },
  {
    slug: "cookies",
    title: "Política de Cookies",
    short: "Política de cookies",
    updated: UPDATED,
    intro:
      "Este sitio usa la menor cantidad posible de cookies y almacenamiento local. No usamos cookies de publicidad ni vendemos datos a terceros.",
    sections: [
      {
        heading: "1. Qué usamos",
        list: [
          "Almacenamiento técnico necesario para que el sitio funcione, mantener la sesión del panel de administración y recordar preferencias (por ejemplo, tu lista de salidas guardadas o el cierre de este aviso).",
          "Medición propia y anónima de visitas: página vista, país aproximado y tipo de dispositivo. No se guarda la dirección IP ni la ubicación exacta, y no se cuentan las visitas del propio equipo del club.",
        ],
      },
      {
        heading: "2. Qué NO usamos",
        list: [
          "Cookies de publicidad o de redes sociales para seguimiento.",
          "Herramientas de analítica de terceros que envíen tus datos fuera de nuestra base de datos.",
        ],
      },
      {
        heading: "3. Cómo controlarlo",
        paragraphs: [
          "Puedes bloquear o borrar el almacenamiento del sitio desde la configuración de tu navegador. Si lo haces, algunas funciones (como recordar tu lista de salidas) dejarán de estar disponibles.",
        ],
      },
    ],
  },
];

export function getLegalDoc(slug: string): LegalDoc | undefined {
  return LEGAL_DOCS.find((doc) => doc.slug === slug);
}
