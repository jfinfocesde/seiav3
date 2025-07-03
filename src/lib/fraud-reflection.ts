// Reflexiones filosóficas de pensadores de la historia
const reflections = [
  {
    title: 'Sócrates',
    message: 'La verdadera sabiduría está en reconocer la propia ignorancia.',
    suggestion: 'Reflexiona sobre el valor de aprender por ti mismo.'
  },
  {
    title: 'Immanuel Kant',
    message: 'La honestidad es mejor que cualquier política.',
    suggestion: 'Actúa siempre de acuerdo a principios éticos.'
  },
  {
    title: 'Confucio',
    message: 'El hombre que ha cometido un error y no lo corrige comete otro error mayor.',
    suggestion: 'Corrige el rumbo y sigue aprendiendo con integridad.'
  },
  {
    title: 'Albert Einstein',
    message: 'El ejemplo no es la mejor manera de educar, es la única.',
    suggestion: 'Sé ejemplo de honestidad en tu aprendizaje.'
  },
  {
    title: 'Aristóteles',
    message: 'La excelencia moral es el resultado del hábito.',
    suggestion: 'Haz de la honestidad un hábito diario.'
  },
  {
    title: 'Platón',
    message: 'La educación es el encendido de una llama, no el llenado de un recipiente.',
    suggestion: 'Busca el conocimiento por el placer de aprender.'
  },
  {
    title: 'Nelson Mandela',
    message: 'La educación es el arma más poderosa que puedes usar para cambiar el mundo.',
    suggestion: 'Utiliza tu aprendizaje para construir un futuro mejor.'
  },
  {
    title: 'Leonardo da Vinci',
    message: 'Aprender nunca cansa la mente.',
    suggestion: 'Disfruta el proceso de aprender con honestidad.'
  },
  {
    title: 'Mahatma Gandhi',
    message: 'Vive como si fueras a morir mañana. Aprende como si fueras a vivir siempre.',
    suggestion: 'Aprovecha cada oportunidad para aprender con integridad.'
  },
  {
    title: 'Simone de Beauvoir',
    message: 'El conocimiento es el único bien que crece cuando se comparte.',
    suggestion: 'Comparte lo que aprendes de manera honesta.'
  },
  // 40 citas adicionales:
  {
    title: 'René Descartes',
    message: 'Pienso, luego existo.',
    suggestion: 'Cuestiona y reflexiona sobre tus ideas.'
  },
  {
    title: 'Friedrich Nietzsche',
    message: 'Sin música, la vida sería un error.',
    suggestion: 'Encuentra inspiración en el arte y la creatividad.'
  },
  {
    title: 'John Locke',
    message: 'El conocimiento es la percepción del acuerdo o desacuerdo entre dos ideas.',
    suggestion: 'Analiza y compara para comprender mejor.'
  },
  {
    title: 'Jean-Jacques Rousseau',
    message: 'El hombre nace libre, pero en todos lados está encadenado.',
    suggestion: 'Valora tu libertad intelectual.'
  },
  {
    title: 'Voltaire',
    message: 'Juzga a un hombre por sus preguntas más que por sus respuestas.',
    suggestion: 'Haz preguntas profundas y busca el porqué.'
  },
  {
    title: 'Blaise Pascal',
    message: 'El corazón tiene razones que la razón no entiende.',
    suggestion: 'Escucha tanto a tu mente como a tu corazón.'
  },
  {
    title: 'David Hume',
    message: 'La belleza de las cosas existe en el espíritu de quien las contempla.',
    suggestion: 'Aprecia la diversidad de perspectivas.'
  },
  {
    title: 'Baruch Spinoza',
    message: 'La paz no es ausencia de guerra, es una virtud.',
    suggestion: 'Busca la paz interior y la virtud en tus acciones.'
  },
  {
    title: 'Thomas Hobbes',
    message: 'El conocimiento es poder.',
    suggestion: 'Utiliza el conocimiento para el bien.'
  },
  {
    title: 'Karl Marx',
    message: 'Los filósofos solo han interpretado el mundo, pero de lo que se trata es de transformarlo.',
    suggestion: 'Aplica lo aprendido para mejorar tu entorno.'
  },
  {
    title: 'Simone Weil',
    message: 'La atención, tomada en su máxima pureza, es la oración.',
    suggestion: 'Concéntrate plenamente en tu aprendizaje.'
  },
  {
    title: 'Hannah Arendt',
    message: 'La educación es el punto en el que decidimos si amamos el mundo lo suficiente como para asumir la responsabilidad de él.',
    suggestion: 'Asume tu responsabilidad como aprendiz.'
  },
  {
    title: 'Michel Foucault',
    message: 'El conocimiento es poder.',
    suggestion: 'Cuestiona las estructuras y busca la verdad.'
  },
  {
    title: 'Ludwig Wittgenstein',
    message: 'Los límites de mi lenguaje son los límites de mi mundo.',
    suggestion: 'Expande tu vocabulario y tu visión.'
  },
  {
    title: 'Bertrand Russell',
    message: 'El problema de la humanidad es que los estúpidos están seguros de todo y los inteligentes están llenos de dudas.',
    suggestion: 'Abraza la duda como parte del aprendizaje.'
  },
  {
    title: 'Jean-Paul Sartre',
    message: 'Estamos condenados a ser libres.',
    suggestion: 'Elige tu camino con responsabilidad.'
  },
  {
    title: 'Albert Camus',
    message: 'La verdadera generosidad hacia el futuro consiste en entregarlo todo al presente.',
    suggestion: 'Da lo mejor de ti en cada momento.'
  },
  {
    title: 'Martin Heidegger',
    message: 'El ser es el ser del ser.',
    suggestion: 'Reflexiona sobre tu existencia y propósito.'
  },
  {
    title: 'Heráclito',
    message: 'Nadie se baña dos veces en el mismo río.',
    suggestion: 'Acepta el cambio como parte del aprendizaje.'
  },
  {
    title: 'Epicuro',
    message: 'No arruines lo que tienes deseando lo que no tienes.',
    suggestion: 'Aprecia lo que has logrado hasta ahora.'
  },
  {
    title: 'Séneca',
    message: 'No es que tengamos poco tiempo, sino que perdemos mucho.',
    suggestion: 'Aprovecha tu tiempo de estudio.'
  },
  {
    title: 'Marco Aurelio',
    message: 'La felicidad de tu vida depende de la calidad de tus pensamientos.',
    suggestion: 'Cultiva pensamientos positivos y honestos.'
  },
  {
    title: 'Francis Bacon',
    message: 'El conocimiento es en sí mismo poder.',
    suggestion: 'Busca el conocimiento por el valor que tiene.'
  },
  {
    title: 'Mary Wollstonecraft',
    message: 'No deseo que las mujeres tengan poder sobre los hombres, sino sobre sí mismas.',
    suggestion: 'Empodérate a través del aprendizaje.'
  },
  {
    title: 'Hypatia de Alejandría',
    message: 'Defiende tu derecho a pensar, porque incluso pensar de manera errónea es mejor que no pensar.',
    suggestion: 'Atrévete a pensar por ti mismo.'
  },
  {
    title: 'Ralph Waldo Emerson',
    message: 'El conocimiento existe para ser compartido.',
    suggestion: 'Comparte lo que aprendes con otros.'
  },
  {
    title: 'Henry David Thoreau',
    message: 'Lo que un hombre piensa de sí mismo, esto es lo que determina, o más bien indica, su destino.',
    suggestion: 'Cree en tu capacidad de aprender.'
  },
  {
    title: 'Søren Kierkegaard',
    message: 'La vida solo puede ser comprendida mirando hacia atrás, pero debe ser vivida hacia adelante.',
    suggestion: 'Aprende del pasado y sigue avanzando.'
  },
  {
    title: 'Augusto Comte',
    message: 'Saber para prever, prever para poder.',
    suggestion: 'Utiliza el conocimiento para anticipar y actuar.'
  },
  {
    title: 'Arthur Schopenhauer',
    message: 'La salud no lo es todo, pero sin ella, todo lo demás es nada.',
    suggestion: 'Cuida tu bienestar mientras aprendes.'
  },
  {
    title: 'Simone de Beauvoir',
    message: 'No se nace mujer: se llega a serlo.',
    suggestion: 'Construye tu identidad a través del conocimiento.'
  },
  {
    title: 'Isaiah Berlin',
    message: 'La libertad para los lobos ha significado la muerte para las ovejas.',
    suggestion: 'Busca la justicia y la equidad en tu entorno.'
  },
  {
    title: 'José Ortega y Gasset',
    message: 'Yo soy yo y mi circunstancia.',
    suggestion: 'Reconoce el contexto de tu aprendizaje.'
  },
  {
    title: 'Antonio Gramsci',
    message: 'Instruíos porque necesitaremos toda nuestra inteligencia.',
    suggestion: 'Nunca dejes de formarte.'
  },
  {
    title: 'Edmund Husserl',
    message: 'A las cosas mismas.',
    suggestion: 'Ve siempre a la raíz de los problemas.'
  },
  {
    title: 'Gilles Deleuze',
    message: 'No hay que temer a la locura, sino a la mediocridad.',
    suggestion: 'Atrévete a pensar diferente.'
  },
  {
    title: 'Judith Butler',
    message: 'El género es una construcción social.',
    suggestion: 'Cuestiona los supuestos y aprende críticamente.'
  },
  {
    title: 'Martha Nussbaum',
    message: 'La educación es la capacidad de ver el mundo a través de los ojos de otro.',
    suggestion: 'Practica la empatía intelectual.'
  },
  {
    title: 'Peter Singer',
    message: 'La ética no es una cuestión de sentimientos, sino de argumentos.',
    suggestion: 'Sustenta tus ideas con razones.'
  },
  {
    title: 'Richard Rorty',
    message: 'La verdad no está ahí fuera.',
    suggestion: 'Construye tu propio entendimiento.'
  },
  {
    title: 'Michel de Montaigne',
    message: 'Enseñar no es transferir conocimiento, sino crear las posibilidades para su producción.',
    suggestion: 'Sé protagonista de tu aprendizaje.'
  },
  {
    title: 'Zygmunt Bauman',
    message: 'La educación es la respuesta a un mundo en constante cambio.',
    suggestion: 'Adáptate y aprende siempre.'
  },
  {
    title: 'Jiddu Krishnamurti',
    message: 'No es signo de buena salud estar bien adaptado a una sociedad profundamente enferma.',
    suggestion: 'Cuestiona y busca tu propio camino.'
  },
  {
    title: 'Albert Schweitzer',
    message: 'El ejemplo no es lo principal para influir en los demás, es lo único.',
    suggestion: 'Sé ejemplo de integridad.'
  },
  {
    title: 'Gabriel Marcel',
    message: 'Ser es ser con otros.',
    suggestion: 'Aprende en comunidad y comparte tu experiencia.'
  },
  {
    title: 'Paul Ricoeur',
    message: 'El sentido de la vida es la vida con sentido.',
    suggestion: 'Busca propósito en tu aprendizaje.'
  },
  // 20 reflexiones nuevas:
  {
    title: 'Pitágoras',
    message: 'Educa a los niños y no será necesario castigar a los hombres.',
    suggestion: 'La formación ética comienza desde el aprendizaje.'
  },
  {
    title: 'Sófocles',
    message: 'No hay testigo más terrible, ni acusador más poderoso que la conciencia que mora en el corazón del hombre.',
    suggestion: 'Escucha tu conciencia al actuar.'
  },
  {
    title: 'Cicerón',
    message: 'La confianza, como el arte, nunca proviene de tener todas las respuestas, sino de estar abierto a todas las preguntas.',
    suggestion: 'Sé honesto contigo mismo y con los demás.'
  },
  {
    title: 'Erasmo de Rotterdam',
    message: 'El colmo de la estupidez es aprender lo que luego hay que olvidar.',
    suggestion: 'Aprende con sentido y honestidad.'
  },
  {
    title: 'San Agustín',
    message: 'La verdad es como un león; no necesitas defenderla. Déjala libre y se defenderá sola.',
    suggestion: 'Busca la verdad en tu aprendizaje.'
  },
  {
    title: 'Avicena',
    message: 'El conocimiento es la vida del intelecto.',
    suggestion: 'Alimenta tu mente con aprendizaje genuino.'
  },
  {
    title: 'Maimónides',
    message: 'El objetivo de la educación es la acción, no el conocimiento.',
    suggestion: 'Pon en práctica lo que aprendes con honestidad.'
  },
  {
    title: 'Tomás de Aquino',
    message: 'Teme al hombre de un solo libro.',
    suggestion: 'Busca diversas fuentes y aprende con amplitud.'
  },
  {
    title: 'Jean Bodin',
    message: 'La educación es la mejor provisión para la vejez.',
    suggestion: 'Invierte en tu aprendizaje honesto para el futuro.'
  },
  {
    title: 'Francisco de Vitoria',
    message: 'El hombre es libre por naturaleza.',
    suggestion: 'Usa tu libertad para elegir la honestidad.'
  },
  {
    title: 'Giordano Bruno',
    message: 'No es la fe la que salva, sino la verdad.',
    suggestion: 'Sé fiel a la verdad en tu camino académico.'
  },
  {
    title: 'Francis Hutcheson',
    message: 'La acción más virtuosa es la que produce la mayor felicidad para el mayor número.',
    suggestion: 'Piensa en el bien común al actuar.'
  },
  {
    title: 'John Stuart Mill',
    message: 'La libertad no es útil si no es para hacer el bien.',
    suggestion: 'Usa tu libertad para aprender y actuar con ética.'
  },
  {
    title: 'Harriet Martineau',
    message: 'La moralidad es la base de las cosas y la verdad es la sustancia de toda moralidad.',
    suggestion: 'Haz de la verdad tu guía en el aprendizaje.'
  },
  {
    title: 'José Martí',
    message: 'Ser culto es el único modo de ser libre.',
    suggestion: 'La honestidad intelectual te hace libre.'
  },
  {
    title: 'Antonio Gramsci',
    message: 'La indiferencia es el peso muerto de la historia.',
    suggestion: 'Comprométete activamente con tu aprendizaje.'
  },
  {
    title: 'Simone Weil',
    message: 'La atención absoluta es oración.',
    suggestion: 'Pon atención plena y honesta en tu estudio.'
  },
  {
    title: 'Hildegarda de Bingen',
    message: 'La sabiduría es la raíz, la honestidad es el fruto.',
    suggestion: 'Deja que tu aprendizaje florezca en honestidad.'
  },
  {
    title: 'Sor Juana Inés de la Cruz',
    message: 'No estudio para saber más, sino para ignorar menos.',
    suggestion: 'Reconoce tus límites y aprende con humildad.'
  },
  {
    title: 'Emmanuel Levinas',
    message: 'La ética es una óptica.',
    suggestion: 'Mira el aprendizaje desde la responsabilidad y el respeto.'
  }
];

export interface FraudReflectionResult {
  title: string;
  message: string;
  suggestion: string;
}

/**
 * Devuelve una cita filosófica aleatoria de un pensador de la historia.
 */
export async function generateFraudReflection(): Promise<FraudReflectionResult> {
  const randomIndex = Math.floor(Math.random() * reflections.length);
  return reflections[randomIndex];
}