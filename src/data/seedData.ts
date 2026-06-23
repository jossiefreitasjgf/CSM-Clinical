import { Clinic, TherapeuticEvent, Patient, Registration, EvolutionaryAssessment, MedicalRecord, Appointment, FinancialTransaction, Attendance, SystemUser } from '../types';

export const initialClinics: Clinic[] = [
  {
    id: 'clinic-1',
    name: 'CSM Clinical SP - Matriz',
    document: '12.345.678/0001-99',
    address: 'Av. Paulista, 1500 - Bela Vista, São Paulo - SP',
    phone: '(11) 98765-4321',
    plan: 'Prata',
    status: 'Ativo',
    responsibleDoctor: 'Dra. Ana Flávia Silveira',
    financialManager: 'Gustavo Rodrigues Leitão'
  },
  {
    id: 'clinic-2',
    name: 'CSM Clinical RJ - KidsUp',
    document: '98.765.432/0001-11',
    address: 'Av. das Américas, 4200 - Barra da Tijuca, Rio de Janeiro - RJ',
    phone: '(21) 99887-7665',
    plan: 'Bronze',
    status: 'Ativo',
    responsibleDoctor: 'Dr. João Mendes Filho',
    financialManager: 'Renata Vasconcellos'
  }
];

export const initialSystemUsers: SystemUser[] = [
  {
    id: 'user-dev',
    clinicId: 'clinic-1',
    name: 'Jossie Freitas',
    email: 'jossiefreitas.jgf@gmail.com',
    role: 'Desenvolvedor',
    status: 'Ativo',
    createdAt: '2026-06-23',
    password: '1234'
  },
  {
    id: 'user-1',
    clinicId: 'clinic-1',
    name: 'Dra. Ana Flávia Silveira',
    email: 'ana.flavia@csmclinical.com.br',
    role: 'Admin',
    status: 'Ativo',
    createdAt: '2026-01-10',
    password: '1234'
  },
  {
    id: 'user-2',
    clinicId: 'clinic-1',
    name: 'Dra. Gabriela Nunes',
    email: 'gabriela.nunes@csmclinical.com.br',
    role: 'Fisio',
    status: 'Ativo',
    createdAt: '2026-02-15',
    password: '1234'
  },
  {
    id: 'user-3',
    clinicId: 'clinic-1',
    name: 'Silvia Souza',
    email: 'silvia.recepcao@csmclinical.com.br',
    role: 'Recepcao',
    status: 'Ativo',
    createdAt: '2026-03-01',
    password: '1234'
  },
  {
    id: 'user-4',
    clinicId: 'clinic-2',
    name: 'Dr. João Mendes Filho',
    email: 'joao.mendes@csmclinical.com.br',
    role: 'Admin',
    status: 'Ativo',
    createdAt: '2026-04-12',
    password: '1234'
  }
];

export const initialEvents: TherapeuticEvent[] = [
  {
    id: 'event-1',
    clinicId: 'clinic-1',
    name: 'Circuito Psicomotor dos Super-Heróis',
    theme: 'Estimulação Motora Ampla e Planejamento Motor',
    description: 'Um circuito lúdico voltado para o desenvolvimento de coordenação motora grossa, equilíbrio e fortalecimento muscular global em crianças de 4 a 8 anos. Com fantásticos desafios inspirados em heróis de quadrinhos!',
    date: '2026-06-25',
    time: '14:00',
    location: 'Área Verde - FisioKids Matriz',
    price: 150.00,
    maxParticipants: 10,
    status: 'Aberto',
    image: 'https://images.unsplash.com/photo-1545558014-8687977e99a5?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'event-2',
    clinicId: 'clinic-1',
    name: 'Oficina Sensorial: Descobrindo o Mundo',
    theme: 'Processamento Sensorial e Integração',
    description: 'Atividade focada em regulação do processamento tátil, proprioceptivo e vestibular através de texturas, brinquedos e jogos lúdicos. Voltada para crianças com transtorno do processamento sensorial ou espectro autista.',
    date: '2026-06-28',
    time: '09:30',
    location: 'Sala de Integração Sensorial',
    price: 180.00,
    maxParticipants: 6,
    status: 'Aberto',
    image: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'event-3',
    clinicId: 'clinic-1',
    name: 'Arraiá Terapêutico: Festa Junina Adaptada',
    theme: 'Socialização, Ritmo e Coordenação',
    description: 'Evento integrador tradicional com danças de quadrilha adaptadas, pescaria terapêutica com foco em pinça e motricidade fina, e desenvolvimento de habilidades sociais em grupo.',
    date: '2026-06-12',
    time: '15:00',
    location: 'Estacionamento e Quadra - FisioKids',
    price: 80.00,
    maxParticipants: 20,
    status: 'Encerrado',
    image: 'https://images.unsplash.com/photo-1533256692281-7c9ac70327f2?auto=format&fit=crop&q=80&w=400'
  }
];

export const initialPatients: Patient[] = [
  {
    id: 'patient-1',
    clinicId: 'clinic-1',
    photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200',
    name: 'Enzo Gabriel Santos',
    birthDate: '2019-04-12', // 7 anos (em 2026)
    gender: 'M',
    fatherName: 'Marcos Santos',
    motherName: 'Ana Cláudia Santos',
    guardianName: 'Ana Cláudia Santos',
    cpf: '456.789.231-09',
    phone: '(11) 98122-3344',
    whatsapp: '11981223344',
    email: 'anaclaudia.santos@email.com',
    diagnosis: 'Paralisia Cerebral Hemiparética Direita',
    limitations: 'Discreta espasticidade em MSD e clônus em tornozelo D.',
    allergies: 'Dipirona, Poeira',
    medications: 'Baclofeno 5mg (1x ao dia)',
    notes: 'Realiza sessões de fisioterapia motor 3x por semana. Muito esforçado e adora dinossauros!',
    createdAt: '2025-01-10T10:00:00.000Z'
  },
  {
    id: 'patient-2',
    clinicId: 'clinic-1',
    photo: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&q=80&w=200',
    name: 'Valentina Ribeiro Lima',
    birthDate: '2021-08-20', // ~5 anos
    gender: 'F',
    fatherName: 'Roberto Lima',
    motherName: 'Juliana Ribeiro',
    guardianName: 'Juliana Ribeiro',
    cpf: '123.890.456-12',
    phone: '(11) 97722-1100',
    whatsapp: '11977221100',
    email: 'juliana.ribeiro@email.com',
    diagnosis: 'Transtorno do Espectro Autista (TEA nível 2 de suporte)',
    limitations: 'Aversão a barulhos agudos, atraso de linguagem e rigidez cognitiva.',
    allergies: 'Glúten (intolerância leve)',
    medications: 'Nenhum',
    notes: 'Faz acompanhamento multidisciplinar (Fisio, TO e Fono). Estimular bastante imitação motora e contato visual.',
    createdAt: '2025-03-15T14:30:00.000Z'
  },
  {
    id: 'patient-3',
    clinicId: 'clinic-1',
    photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200',
    name: 'Lucas de Souza Peixoto',
    birthDate: '2018-11-05', // 7 anos
    gender: 'M',
    fatherName: 'Felipe Peixoto',
    motherName: 'Beatriz de Souza',
    guardianName: 'Beatriz de Souza',
    cpf: '298.374.920-44',
    phone: '(11) 96543-9876',
    whatsapp: '11965439876',
    email: 'beatriz.souza@email.com',
    diagnosis: 'Mielomeningoceles (Corrigida L4-L5)',
    limitations: 'Déficit de força em membros inferiores, faz uso de órteses AFO para deambular.',
    allergies: 'Sem alergias conhecidas',
    medications: 'Nenhum',
    notes: 'Foco no ganho de força de tronco, quadril e treino de marcha com andador / órtese.',
    createdAt: '2024-09-02T11:15:00.000Z'
  },
  {
    id: 'patient-4',
    clinicId: 'clinic-1',
    photo: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&q=80&w=200',
    name: 'Sophia Ferreira Castro',
    birthDate: '2022-02-14', // 4 anos
    gender: 'F',
    fatherName: 'Daniel Castro',
    motherName: 'Camila Ferreira',
    guardianName: 'Camila Ferreira',
    cpf: '381.992.512-88',
    phone: '(11) 98012-4455',
    whatsapp: '11980124455',
    email: 'camila.f@email.com',
    diagnosis: 'Síndrome de Down (Trissomia do 21)',
    limitations: 'Hipotonia muscular generalizada, frouxidão ligamentar importante.',
    allergies: 'Lactose',
    medications: 'Nenhum',
    notes: 'Objetivos: Fortalecimento de cinturas e coativação articular. Adora música e canções estimuladas.',
    createdAt: '2025-11-20T09:00:00.000Z'
  }
];

export const initialRegistrations: Registration[] = [
  {
    id: 'reg-1',
    clinicId: 'clinic-1',
    eventId: 'event-3', // Arraiá (Encerrado)
    childId: 'patient-1', // Enzo
    childName: 'Enzo Gabriel Santos',
    parentName: 'Ana Cláudia Santos',
    registrationNumber: 'INS-2026-0001',
    date: '2026-06-05',
    status: 'Aprovado',
    paymentReceiptName: 'comprovante_pix_enzo.png',
    paymentReceiptSize: '142 KB',
    ageCalculated: 7
  },
  {
    id: 'reg-2',
    clinicId: 'clinic-1',
    eventId: 'event-3', // Arraiá (Encerrado)
    childId: 'patient-3', // Lucas
    childName: 'Lucas de Souza Peixoto',
    parentName: 'Beatriz de Souza',
    registrationNumber: 'INS-2026-0002',
    date: '2026-06-06',
    status: 'Aprovado',
    paymentReceiptName: 'pix_marido_arraiaph.pdf',
    paymentReceiptSize: '210 KB',
    ageCalculated: 7
  },
  {
    id: 'reg-3',
    clinicId: 'clinic-1',
    eventId: 'event-1', // Circuito Heróis (Aberto)
    childId: 'patient-1', // Enzo
    childName: 'Enzo Gabriel Santos',
    parentName: 'Ana Cláudia Santos',
    registrationNumber: 'INS-2026-0003',
    date: '2026-06-20',
    status: 'Aprovado',
    paymentReceiptName: 'comprovante_circuito_enzo.png',
    paymentReceiptSize: '185 KB',
    ageCalculated: 7
  },
  {
    id: 'reg-4',
    clinicId: 'clinic-1',
    eventId: 'event-1', // Circuito Heróis (Aberto)
    childId: 'patient-2', // Valentina
    childName: 'Valentina Ribeiro Lima',
    parentName: 'Juliana Ribeiro',
    registrationNumber: 'INS-2026-0004',
    date: '2026-06-21',
    status: 'Pendente',
    paymentReceiptName: 'captura_tela_pagto.jpg',
    paymentReceiptSize: '450 KB',
    ageCalculated: 4
  }
];

export const initialAttendances: Attendance[] = [
  {
    id: 'att-1',
    eventId: 'event-3',
    patientId: 'patient-1',
    present: true,
    notes: 'Enzo aproveitou imensamente, participou das danças com apoio e adorou a pescaria.'
  },
  {
    id: 'att-2',
    eventId: 'event-3',
    patientId: 'patient-3',
    present: true,
    notes: 'Lucas deambulou com andador de forma segura na quadrilha, realizou preensão palmar adequada.'
  }
];

export const initialAssessments: EvolutionaryAssessment[] = [
  // Enzo Assessments (Acompanhamento evolutivo chronológico)
  {
    id: 'eval-1',
    patientId: 'patient-1',
    date: '2025-10-15',
    author: 'Dra. Gabriela Nunes (Fisioterapeuta)',
    coord: 2,
    equilibrio: 2,
    mobilidade: 3,
    forca: 2,
    motricidadeFina: 2,
    interacao: 4,
    comunicacao: 4,
    participacaoGrupo: 3,
    notes: 'Avaliação inicial para traçar metas de 2026. Enzo apresenta limitação mecânica no lado direito, porém tenta recrutar ativamente.'
  },
  {
    id: 'eval-2',
    patientId: 'patient-1',
    date: '2026-02-10',
    author: 'Dra. Gabriela Nunes (Fisioterapeuta)',
    coord: 3,
    equilibrio: 3,
    mobilidade: 3,
    forca: 3,
    motricidadeFina: 2,
    interacao: 4,
    comunicacao: 5,
    participacaoGrupo: 4,
    notes: 'Melhora notável em descarga de peso em membro inferior direito após treino de esteira de marcha.'
  },
  {
    id: 'eval-3',
    patientId: 'patient-1',
    date: '2026-06-18',
    author: 'Dra. Gabriela Nunes (Fisioterapeuta)',
    coord: 4,
    equilibrio: 3,
    mobilidade: 4,
    forca: 4,
    motricidadeFina: 3,
    interacao: 5,
    comunicacao: 5,
    participacaoGrupo: 5,
    notes: 'Enzo avançou muito na autoconfiança! Apresenta boa marcha independente, corre com desvio, mas com alta funcionalidade e excelente integração com outras crianças.'
  },
  
  // Valentina Assessments
  {
    id: 'eval-4',
    patientId: 'patient-2',
    date: '2026-03-25',
    author: 'Dra. Luana Schmidt (Fisioterapeuta)',
    coord: 3,
    equilibrio: 2,
    mobilidade: 4,
    forca: 3,
    motricidadeFina: 2,
    interacao: 1,
    comunicacao: 2,
    participacaoGrupo: 1,
    notes: 'Avaliação inicial. Valentina corre e salta bem, porém tem dificuldade de manter atenção compartilhada por mais de 30 segundos.'
  },
  {
    id: 'eval-5',
    patientId: 'patient-2',
    date: '2026-06-05',
    author: 'Dra. Luana Schmidt (Fisioterapeuta)',
    coord: 3,
    equilibrio: 3,
    mobilidade: 4,
    forca: 3,
    motricidadeFina: 3,
    interacao: 3,
    comunicacao: 3,
    participacaoGrupo: 2,
    notes: 'Valentina demonstrou resposta positiva às pistas táteis e visuais estruturadas. Interação e humor mais estáveis.'
  }
];

export const initialMedicalRecords: MedicalRecord[] = [
  {
    id: 'rec-1',
    patientId: 'patient-1',
    date: '2025-01-11',
    title: 'Ficha de Anamnese e História Gestacional',
    type: 'Anamnese',
    description: 'Nascido de parto prematuro (31 semanas). Internado em UTI Neo por 22 dias. Identificado atraso no rolar e engatinhar. Diagnóstico médico firmado aos 18 meses. Atualmente estuda em escola regular e realiza terapias integradas.',
    author: 'Dra. Gabriela Nunes (Fisioterapeuta)',
    attachments: [
      { name: 'laudo_fisiatrico_2025.pdf', size: '1.2 MB', date: '2025-01-11' },
      { name: 'resonância_magnetica_2024.jpg', size: '2.4 MB', date: '2024-11-05' }
    ]
  },
  {
    id: 'rec-2',
    patientId: 'patient-1',
    date: '2026-03-10',
    title: 'Relatório Trimestral para Escola',
    type: 'Relatório',
    description: 'Paciente Enzo Gabriel Santos, 7 anos, apresenta boa mobilidade e funcionalidade geral. Sugere-se adaptações em educação física escolar com foco em inclusão: redução da velocidade das atividades competitivas e estímulo ao uso bimanual nas tarefas.',
    author: 'Dra. Gabriela Nunes (Fisioterapeuta)',
    attachments: [
      { name: 'relatorio_trimestral_escola.pdf', size: '450 KB', date: '2026-03-10' }
    ]
  }
];

export const initialAppointments: Appointment[] = [
  {
    id: 'app-1',
    clinicId: 'clinic-1',
    patientId: 'patient-1',
    patientName: 'Enzo Gabriel Santos',
    date: '2026-06-22',
    time: '14:30',
    type: 'Fisioterapia Motor',
    price: 150.00,
    status: 'Realizado'
  },
  {
    id: 'app-2',
    clinicId: 'clinic-1',
    patientId: 'patient-2',
    patientName: 'Valentina Ribeiro Lima',
    date: '2026-06-22',
    time: '16:00',
    type: 'Integração Sensorial',
    price: 180.00,
    status: 'Realizado'
  },
  {
    id: 'app-3',
    clinicId: 'clinic-1',
    patientId: 'patient-3',
    patientName: 'Lucas de Souza Peixoto',
    date: '2026-06-23',
    time: '10:00',
    type: 'Fisioterapia Motor',
    price: 150.00,
    status: 'Agendado'
  },
  {
    id: 'app-4',
    clinicId: 'clinic-1',
    patientId: 'patient-4',
    patientName: 'Sophia Ferreira Castro',
    date: '2026-06-23',
    time: '11:00',
    type: 'Estimulação Precoce',
    price: 150.00,
    status: 'Agendado'
  },
  {
    id: 'app-5',
    clinicId: 'clinic-1',
    patientId: 'patient-1',
    patientName: 'Enzo Gabriel Santos',
    date: '2026-06-24',
    time: '15:00',
    type: 'Fisioterapia Motor',
    price: 150.00,
    status: 'Agendado'
  },
  {
    id: 'app-6',
    clinicId: 'clinic-1',
    patientId: 'patient-2',
    patientName: 'Valentina Ribeiro Lima',
    date: '2026-06-24',
    time: '16:30',
    type: 'Integração Sensorial',
    price: 180.00,
    status: 'Agendado'
  }
];

export const initialTransactions: FinancialTransaction[] = [
  // Receitas de atendimentos
  {
    id: 'tx-1',
    clinicId: 'clinic-1',
    type: 'Receita',
    category: 'Atendimento Particular',
    value: 150.00,
    date: '2026-06-22',
    description: 'Sessão Fisioterapia Motor - Enzo Gabriel Santos',
    referenceId: 'app-1'
  },
  {
    id: 'tx-2',
    clinicId: 'clinic-1',
    type: 'Receita',
    category: 'Atendimento Particular',
    value: 180.00,
    date: '2026-06-22',
    description: 'Sessão Integração Sensorial - Valentina Ribeiro Lima',
    referenceId: 'app-2'
  },
  // Receitas de eventos aprovadas
  {
    id: 'tx-3',
    clinicId: 'clinic-1',
    type: 'Receita',
    category: 'Inscrição de Evento',
    value: 80.00,
    date: '2026-06-05',
    description: 'Inscrição Arraiá Terapêutico - Enzo Gabriel Santos (INS-2026-0001)',
    referenceId: 'reg-1'
  },
  {
    id: 'tx-4',
    clinicId: 'clinic-1',
    type: 'Receita',
    category: 'Inscrição de Evento',
    value: 80.00,
    date: '2026-06-06',
    description: 'Inscrição Arraiá Terapêutico - Lucas de Souza Peixoto (INS-2026-0002)',
    referenceId: 'reg-2'
  },
  {
    id: 'tx-5',
    clinicId: 'clinic-1',
    type: 'Receita',
    category: 'Inscrição de Evento',
    value: 150.00,
    date: '2026-06-20',
    description: 'Inscrição Circuito Heróis - Enzo Gabriel Santos (INS-2026-0003)',
    referenceId: 'reg-3'
  },
  
  // Despesas (Mês de Junho)
  {
    id: 'tx-6',
    clinicId: 'clinic-1',
    type: 'Despesa',
    category: 'Aluguel',
    value: 1800.00,
    date: '2026-06-01',
    description: 'Pagamento aluguel salas clínica matrimonial'
  },
  {
    id: 'tx-7',
    clinicId: 'clinic-1',
    type: 'Despesa',
    category: 'Materiais',
    value: 320.00,
    date: '2026-06-03',
    description: 'Compra de slime sensorial, bolinhas, massinhas e fitas'
  },
  {
    id: 'tx-8',
    clinicId: 'clinic-1',
    type: 'Despesa',
    category: 'Marketing',
    value: 250.00,
    date: '2026-06-10',
    description: 'Anúncios Instagram para captação do Circuito Psicomotor'
  },
  {
    id: 'tx-9',
    clinicId: 'clinic-1',
    type: 'Despesa',
    category: 'Despesas Diversas',
    value: 120.00,
    date: '2026-06-15',
    description: 'Decoração temática Festa Junina Festa'
  }
];
