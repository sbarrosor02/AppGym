// ========== Static Session Data (from PDF) ==========
const SESSIONS = [
    {
        id: 1,
        name: 'Sesion 1',
        subtitle: 'Tren Superior',
        color: 'var(--session1)',
        warmup: {
            name: 'Calentamiento',
            comment: 'Movilidad Articular del tren superior con gomas. Manguitos'
        },
        exercises: [
            {
                id: 's1e1',
                name: 'Press de banca inclinado Smith',
                sets: 4,
                hasApproachSet: true,
                reps: [15, 12, 10, 8],
                rest: 90,
                comment: 'Buena intensidad, RIR 1. Al acabar la ultima bajas el peso y 1 extra.',
                isPrimary: true
            },
            {
                id: 's1e2',
                name: 'Cruce de poleas alta',
                sets: 3,
                hasApproachSet: true,
                reps: [15, 12, 10, 8],
                rest: 60,
                comment: 'Movimiento hacia abajo no hacia delante. Codos fijos.',
                isPrimary: false
            },
            {
                id: 's1e3',
                name: 'Jalon al pecho',
                sets: 4,
                hasApproachSet: true,
                reps: [15, 12, 10, 8],
                rest: 60,
                comment: 'Agarre algo mas ancho de los hombros. Piernas fijas.',
                isPrimary: true
            },
            {
                id: 's1e4',
                name: 'Remo gironda',
                sets: 3,
                hasApproachSet: true,
                reps: [12, 10, 8, 8],
                rest: 60,
                comment: 'Contraemos 1 segundo en maxima contraccion. RIR 0.',
                isPrimary: false
            },
            {
                id: 's1e5',
                name: 'Elevaciones laterales',
                sets: 5,
                hasApproachSet: true,
                reps: [20, 18, 16, 15, 12],
                rest: 60,
                comment: 'Poco peso. Brazos casi rectos. Seguimos linea escapular.',
                isPrimary: true
            },
            {
                id: 's1e6',
                name: 'Biceps con mancuerna',
                sets: 4,
                hasApproachSet: false,
                reps: [15, 12, 10, 8],
                rest: 60,
                comment: 'De pie, hacemos giro de muneca durante el movimiento.',
                isPrimary: false
            },
            {
                id: 's1e7',
                name: 'Triceps en polea baja',
                sets: 4,
                hasApproachSet: false,
                reps: [15, 12, 10, 8],
                rest: 60,
                comment: 'Con cuerda, polea altura de la rodilla. Movimiento vertical.',
                isPrimary: false
            }
        ],
        cooldown: {
            id: 's1cd',
            name: 'Plancha frontal',
            sets: 3,
            reps: [null, null, null],
            rest: 30,
            comment: 'Plancha frontal. 3 series. Lo maximo posible.'
        }
    },
    {
        id: 2,
        name: 'Sesion 2',
        subtitle: 'Tren Inferior',
        color: 'var(--session2)',
        warmup: {
            name: 'Calentamiento',
            comment: 'Movilidad articular tren inferior'
        },
        exercises: [
            {
                id: 's2e1',
                name: 'Zancadas andando',
                sets: 4,
                hasApproachSet: false,
                reps: [12, 10, 10, 8],
                rest: 90,
                comment: 'RIR 0. Mov. controlado lento. Si podemos anadir algo de peso.',
                isPrimary: true
            },
            {
                id: 's2e2',
                name: 'Sentadilla libre con salto',
                sets: 4,
                hasApproachSet: true,
                reps: [null, null, null, null],
                rest: 90,
                comment: 'Con barra, bajamos lento y salto explosivo controlado.',
                isPrimary: true
            },
            {
                id: 's2e3',
                name: 'Subida al cajon (Step up)',
                sets: 4,
                hasApproachSet: false,
                reps: [12, 10, 8, 8],
                rest: 60,
                comment: 'Utilizamos un cajon grande. Mov. controlado. Cuerpo hacia delante.',
                isPrimary: false
            },
            {
                id: 's2e4',
                name: 'Sentadilla bulgara',
                sets: 4,
                hasApproachSet: false,
                reps: [12, 10, 10, 8],
                rest: 90,
                comment: 'Bajamos lento + salto explosivo. Peso en mano contraria opcional.',
                isPrimary: true
            },
            {
                id: 's2e5',
                name: 'Femoral de pie',
                sets: 4,
                hasApproachSet: false,
                reps: [15, 12, 10, 8],
                rest: 60,
                comment: 'RIR 1. Rango de movimiento completo.',
                isPrimary: false
            },
            {
                id: 's2e6',
                name: 'Gemelo en maquina',
                sets: 4,
                hasApproachSet: false,
                reps: [12, 10, 10, 8],
                rest: 60,
                comment: 'Unilateral.',
                isPrimary: false
            }
        ],
        cooldown: {
            id: 's2cd',
            name: 'Rodillo de antebrazos',
            sets: 3,
            reps: [1, 1, 1],
            rest: 30,
            comment: 'Rodillo de antebrazos. 3 series.'
        }
    },
    {
        id: 3,
        name: 'Sesion 3',
        subtitle: 'Full Body',
        color: 'var(--session3)',
        warmup: {
            id: 's3wu',
            name: 'Flexiones al fallo',
            sets: 4,
            reps: [null, null, null, null],
            rest: 30,
            comment: 'Flexiones al fallo. 4 series.'
        },
        exercises: [
            {
                id: 's3e1',
                name: 'Cruce en polea sentado en banco',
                sets: 4,
                hasApproachSet: true,
                reps: [12, 10, 8, 8],
                rest: 90,
                comment: 'Banco adelantado y poleas altura del hombro. Codos rectos.',
                isPrimary: true
            },
            {
                id: 's3e2',
                name: 'Remo con barra',
                sets: 4,
                hasApproachSet: false,
                reps: [18, 15, 12, 10],
                rest: 60,
                comment: 'Cuerpo hacia delante, sacamos pecho. Barra por debajo del pecho.',
                isPrimary: true
            },
            {
                id: 's3e3',
                name: 'Pull over con polea alta',
                sets: 4,
                hasApproachSet: false,
                reps: [18, 15, 12, 10],
                rest: 60,
                comment: 'RIR 0. Cuerpo bien separado e inclinado. Brazos rectos.',
                isPrimary: false
            },
            {
                id: 's3e4',
                name: 'Elevaciones laterales polea',
                sets: 4,
                hasApproachSet: false,
                reps: [15, 12, 12, 10],
                rest: 45,
                comment: 'Barbilla pegada al pecho, contraemos arriba 1 segundo.',
                isPrimary: false
            },
            {
                id: 's3e5',
                name: 'Peso muerto con barra',
                sets: 4,
                hasApproachSet: false,
                reps: [8, 6, 5, 3],
                rest: 90,
                comment: 'Agarre mixto.',
                isPrimary: true
            },
            {
                id: 's3e6',
                name: 'Sentadilla en maquina Smith',
                sets: 4,
                hasApproachSet: false,
                reps: [15, 12, 10, 8],
                rest: 60,
                comment: 'Pies en posicion neutra. Rango de mov. completo hasta abajo.',
                isPrimary: true
            },
            {
                id: 's3e7',
                name: 'Zancadas laterales',
                sets: 4,
                hasApproachSet: false,
                reps: [null, null, null, null],
                rest: 60,
                comment: 'Explosivas. Vamos a un lado y subimos a posicion inicial explosiva.',
                isPrimary: false
            }
        ],
        cooldown: {
            id: 's3cd',
            name: 'Pull face',
            sets: 4,
            reps: [null, null, null, null],
            rest: 60,
            comment: 'Pull face. Poco peso y al fallo. Cuerda y munecas hacia fuera.'
        }
    },
    {
        id: 4,
        name: 'Sesion 4',
        subtitle: 'Full Body',
        color: 'var(--session4)',
        warmup: {
            id: 's4wu',
            name: 'Sentadilla con salto',
            sets: 4,
            reps: [null, null, null, null],
            rest: 30,
            comment: 'Sentadilla con salto. 4 series.'
        },
        exercises: [
            {
                id: 's4e1',
                name: 'Jacka',
                sets: 4,
                hasApproachSet: true,
                reps: [12, 10, 8, 8],
                rest: 90,
                comment: 'RIR 1. Movimiento lento.',
                isPrimary: true
            },
            {
                id: 's4e2',
                name: 'Femoral tumbado',
                sets: 4,
                hasApproachSet: false,
                reps: [15, 12, 12, 10],
                rest: 60,
                comment: 'Cuerpo pegado al asiento. Gluteo firme.',
                isPrimary: false
            },
            {
                id: 's4e3',
                name: 'Hiperextensiones',
                sets: 4,
                hasApproachSet: true,
                reps: [18, 15, 12, 10],
                rest: 60,
                comment: 'RIR 0. Barbilla al pecho. Banco de hiperextensiones.',
                isPrimary: true
            },
            {
                id: 's4e4',
                name: 'Press de pecho en maquina Telju',
                sets: 4,
                hasApproachSet: true,
                reps: [15, 12, 12, 10],
                rest: 45,
                comment: 'Codos bajos. Pecho sacado.',
                isPrimary: true
            },
            {
                id: 's4e5',
                name: 'Jalon al pecho agarre estrecho',
                sets: 4,
                hasApproachSet: true,
                reps: [8, 6, 5, 3],
                rest: 90,
                comment: 'Movimiento vertical, contraemos al final del movimiento.',
                isPrimary: true
            },
            {
                id: 's4e6',
                name: 'Vuelos posteriores cable',
                sets: 4,
                hasApproachSet: false,
                reps: [18, 15, 12, 10],
                rest: 60,
                comment: 'Cuerpo recto, brazos extendidos. Rango de mov. completo.',
                isPrimary: false
            },
            {
                id: 's4e7',
                name: 'Biceps y triceps con cuerda',
                sets: 3,
                hasApproachSet: false,
                reps: [null, null, null],
                rest: 60,
                comment: 'Superserie. Lo maximo posible en cada serie.',
                isPrimary: false
            }
        ],
        cooldown: {
            id: 's4cd',
            name: 'Plancha frontal + lateral',
            sets: 2,
            reps: [null, null],
            rest: 60,
            comment: 'Plancha frontal + lateral a un lado y otro (1 Serie).'
        }
    }
];

// Helper to format reps display
function formatReps(reps) {
    if (reps === null || reps === undefined) return 'MAX';
    return String(reps);
}

// Helper to format rest time
function formatRest(seconds) {
    if (seconds >= 60) {
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return sec > 0 ? `${min}:${String(sec).padStart(2, '0')}` : `${min}:00`;
    }
    return `${seconds}s`;
}

// Get total sets count for a session (including approach + cooldown)
function getSessionTotalSets(session) {
    let total = 0;
    for (const ex of session.exercises) {
        total += ex.sets;
        if (ex.hasApproachSet) total += 1;
    }
    if (session.cooldown) total += session.cooldown.sets;
    return total;
}

// Get all exercise IDs that use weights (for progress tracking)
function getAllWeightedExercises() {
    const exercises = [];
    for (const session of SESSIONS) {
        for (const ex of session.exercises) {
            exercises.push({
                id: ex.id,
                name: ex.name,
                sessionId: session.id,
                sessionName: session.name
            });
        }
    }
    return exercises;
}
