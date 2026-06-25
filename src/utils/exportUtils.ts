import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import { Patient, MedicalRecord, Registration, TherapeuticEvent, FinancialTransaction, Appointment, Attendance } from '../types';

/**
 * Format date to PT-BR string
 */
function formatDate(dateStr: string): string {
  try {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('pt-BR');
  } catch (e) {
    return dateStr;
  }
}

/**
 * Helper to calculate age from birthDate
 */
function getAge(birthDate: string): number {
  if (!birthDate) return 0;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

/**
 * Helper to add a page-header in jsPDF
 */
function addPDFHeader(doc: jsPDF, title: string, clinicName: string) {
  // Top horizontal accent bar (Emerald Green)
  doc.setFillColor(16, 185, 129); // emerald 500
  doc.rect(0, 0, 210, 8, 'F');

  // Clinic Brand
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(6, 78, 59); // deep green
  doc.text(clinicName.toUpperCase(), 15, 20);

  // Document Title
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // slate 500
  doc.text(title, 15, 25);

  // Date and Time
  const now = new Date();
  doc.setFontSize(8);
  doc.text(`Gerado em: ${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR')}`, 145, 20);

  // Separator line
  doc.setDrawColor(229, 227, 219); // slate 150/200
  doc.setLineWidth(0.5);
  doc.line(15, 28, 195, 28);
}

/**
 * Helper to add a footer
 */
function addPDFFooter(doc: jsPDF, pageNum: number) {
  doc.setDrawColor(229, 227, 219);
  doc.setLineWidth(0.5);
  doc.line(15, 282, 195, 282);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184); // slate 400
  doc.text('CSM Clinical - Sistema de Gestão Multitratamento Pediátrico', 15, 287);
  doc.text(`Página ${pageNum}`, 185, 287);
}

/**
 * EXPORT 1: PATIENT CHART (PRONTUÁRIO) PDF
 */
export function exportPatientChartPDF(patient: Patient, records: MedicalRecord[], clinicName: string) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  let page = 1;
  addPDFHeader(doc, 'PRONTUÁRIO CLÍNICO INTEGRADO', clinicName);
  addPDFFooter(doc, page);

  // Patient Info Block
  doc.setFillColor(248, 250, 252); // soft slate
  doc.rect(15, 33, 180, 52, 'F');
  doc.setDrawColor(241, 245, 249);
  doc.rect(15, 33, 180, 52);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text(patient.name.toUpperCase(), 20, 41);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);

  // Col 1
  doc.text(`Idade: ${getAge(patient.birthDate)} anos (${formatDate(patient.birthDate)})`, 20, 48);
  doc.text(`Gênero: ${patient.gender === 'M' ? 'Masculino' : patient.gender === 'F' ? 'Feminino' : patient.gender}`, 20, 54);
  doc.text(`CPF: ${patient.cpf || 'Não informado'}`, 20, 60);
  doc.text(`Data de Admissão: ${formatDate(patient.createdAt.substring(0, 10))}`, 20, 66);
  doc.text(`WhatsApp: ${patient.whatsapp || patient.phone || 'Não informado'}`, 20, 72);

  // Col 2
  doc.text(`Mãe: ${patient.motherName || 'Não informada'}`, 110, 48);
  doc.text(`Pai: ${patient.fatherName || 'Não informado'}`, 110, 54);
  doc.text(`Responsável Legal: ${patient.guardianName || 'Não informado'}`, 110, 60);
  doc.text(`E-mail: ${patient.email || 'Não informado'}`, 110, 66);
  doc.text(`Telefone: ${patient.phone || 'Não informado'}`, 110, 72);

  // Diagnóstico & Alergias Badges in Patient block
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(254, 243, 199); // amber background
  doc.rect(20, 76, 170, 6, 'F');
  doc.setTextColor(146, 64, 14); // amber 800
  doc.setFontSize(8.5);
  doc.text(`DIAGNÓSTICO CLÍNICO/CID: ${patient.diagnosis || 'Sem diagnóstico formal'}`, 23, 80.5);

  // Clinical Summary Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 118, 110); // teal 700
  doc.text('ANAMNESE E CARACTERÍSTICAS INICIAIS', 15, 93);
  doc.setLineWidth(0.3);
  doc.setDrawColor(204, 251, 241); // teal 100
  doc.line(15, 95, 195, 95);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);

  let currentY = 100;
  
  const limitationsText = doc.splitTextToSize(`Limitações Funcionais: ${patient.limitations || 'Nenhuma limitação relatada.'}`, 175);
  doc.text(limitationsText, 15, currentY);
  currentY += limitationsText.length * 4.5 + 2;

  const medicationsText = doc.splitTextToSize(`Medicamentos em Uso: ${patient.medications || 'Sem uso de medicações regulares.'}`, 175);
  doc.text(medicationsText, 15, currentY);
  currentY += medicationsText.length * 4.5 + 2;

  const allergiesText = doc.splitTextToSize(`Alergias e Restrições: ${patient.allergies || 'Sem alergias relatadas.'}`, 175);
  doc.text(allergiesText, 15, currentY);
  currentY += allergiesText.length * 4.5 + 2;

  const notesText = doc.splitTextToSize(`Notas Clínicas Adicionais: ${patient.notes || 'Nenhuma nota clínica adicional registrada.'}`, 175);
  doc.text(notesText, 15, currentY);
  currentY += notesText.length * 4.5 + 8;

  // Medical Records Timeline (Evoluções)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 118, 110);
  doc.text('HISTÓRICO DE EVOLUÇÕES E ANOTAÇÕES DE SESSÃO', 15, currentY);
  doc.line(15, currentY + 2, 195, currentY + 2);
  currentY += 7;

  if (records.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text('Nenhuma evolução ou registro médico adicionado para este paciente.', 15, currentY);
  } else {
    records.forEach((record) => {
      // Check if we need a new page
      if (currentY > 240) {
        doc.addPage();
        page++;
        addPDFHeader(doc, 'PRONTUÁRIO CLÍNICO INTEGRADO', clinicName);
        addPDFFooter(doc, page);
        currentY = 35;
      }

      // Record card background
      doc.setFillColor(250, 250, 249); // warm gray 50
      doc.rect(15, currentY, 180, 6, 'F');

      // Date and Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      doc.text(`[${record.type}] - ${record.title}`, 17, currentY + 4);

      // Meta (date and author) right-aligned
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`${formatDate(record.date)} por ${record.author}`, 145, currentY + 4);

      currentY += 8;

      // Body text wrapping
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      const wrappedDesc = doc.splitTextToSize(record.description, 174);
      doc.text(wrappedDesc, 18, currentY);
      
      currentY += wrappedDesc.length * 4.5 + 6;
    });
  }

  // Save/Download triggering
  const slugifiedName = patient.name.toLowerCase().replace(/\s+/g, '_');
  doc.save(`prontuario_${slugifiedName}.pdf`);
}

/**
 * EXPORT 2: REGISTRATION RECEIPT / VOUCHER PDF
 */
export function exportRegistrationReceiptPDF(reg: Registration, event: TherapeuticEvent, clinicName: string) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  addPDFHeader(doc, 'COMPROVANTE DE MATRÍCULA E INSCRIÇÃO', clinicName);
  addPDFFooter(doc, 1);

  // Inner frame simulating a receipt ticket
  doc.setDrawColor(226, 232, 240); // slate 200
  doc.setLineWidth(0.8);
  doc.setFillColor(252, 251, 249); // warm sand 50
  doc.rect(20, 35, 170, 130, 'F');
  doc.rect(20, 35, 170, 130);

  // Success indicator banner
  doc.setFillColor(16, 185, 129); // emerald 500
  doc.rect(20, 35, 170, 10, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('INSCRIÇÃO EFETUADA COM SUCESSO - PAGO VIA PIX', 52, 41.5);

  // Receipt Content
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42); // slate 900
  doc.text('COMPROVANTE DE PARTICIPAÇÃO', 55, 57);

  // Ticket Code and Date
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Código de Validação: ${reg.registrationNumber}`, 70, 63);
  doc.text(`Registrado em: ${formatDate(reg.date)}`, 80, 68);

  // Dashed line spacer
  doc.setLineDashPattern([2, 2], 0);
  doc.setDrawColor(203, 213, 225); // slate 300
  doc.line(25, 74, 185, 74);
  doc.setLineDashPattern([], 0); // reset

  // Table information
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text('DETALHES DO EVENTO TERAPÊUTICO', 25, 83);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text('Evento:', 25, 90);
  doc.setFont('helvetica', 'bold');
  doc.text(event.name.toUpperCase(), 50, 90);

  doc.setFont('helvetica', 'normal');
  doc.text('Temática:', 25, 96);
  doc.setFont('helvetica', 'semibold');
  doc.text(event.theme, 50, 96);

  doc.setFont('helvetica', 'normal');
  doc.text('Data e Hora:', 25, 102);
  doc.setFont('helvetica', 'semibold');
  doc.text(`${formatDate(event.date)} às ${event.time}`, 50, 102);

  doc.setFont('helvetica', 'normal');
  doc.text('Local:', 25, 108);
  doc.setFont('helvetica', 'semibold');
  doc.text(event.location, 50, 108);

  // Line spacer
  doc.setDrawColor(241, 245, 249);
  doc.line(25, 114, 185, 114);

  // Insignias of participants
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text('BENEFICIÁRIOS DO ACESSO', 25, 122);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text('Criança:', 25, 129);
  doc.setFont('helvetica', 'bold');
  doc.text(reg.childName, 50, 129);

  doc.setFont('helvetica', 'normal');
  doc.text('Responsável:', 25, 135);
  doc.setFont('helvetica', 'bold');
  doc.text(reg.parentName, 50, 135);

  doc.setFont('helvetica', 'normal');
  doc.text('Idade:', 25, 141);
  doc.setFont('helvetica', 'semibold');
  doc.text(`${reg.ageCalculated} anos`, 50, 141);

  doc.setFont('helvetica', 'normal');
  doc.text('Investimento:', 25, 147);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129); // emerald
  doc.text(`R$ ${event.price.toLocaleString('pt-BR')}`, 50, 147);

  // Instructions Box underneath
  doc.setFillColor(243, 244, 246); // light gray
  doc.rect(20, 170, 170, 30, 'F');
  doc.setDrawColor(229, 231, 235);
  doc.rect(20, 170, 170, 30);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(31, 41, 55);
  doc.text('INSTRUÇÕES IMPORTANTES AOS PAIS:', 25, 176);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(75, 85, 99);
  doc.text('1. Apresente este voucher (digital ou impresso) na entrada do evento para liberar o check-in.', 25, 182);
  doc.text('2. Recomenda-se vestir as crianças com roupas confortáveis para atividades motoras intensas.', 25, 187);
  doc.text('3. Caso a criança tenha restrições alimentares ou alergias, comunique a coordenação clínica com antecedência.', 25, 192);

  // Sign off signature line
  doc.setDrawColor(186, 195, 201);
  doc.line(70, 235, 140, 235);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Assinatura e Validação Digital da Coordenação', 74, 239);

  // Trigger download
  doc.save(`comprovante_${reg.registrationNumber}.pdf`);
}

/**
 * EXPORT 3: CLINICAL REPORTS PDF EXPORT
 */
export function exportReportPDF(
  reportType: 'participantes' | 'evolucao' | 'financeiro' | 'agenda' | 'frequencia',
  clinicName: string,
  data: {
    clinicRegs?: Registration[];
    clinicPatients?: Patient[];
    clinicTx?: FinancialTransaction[];
    clinicApps?: Appointment[];
    attendances?: Attendance[];
    selectedEventId?: string;
    selectedPatientId?: string;
    events?: TherapeuticEvent[];
    patients?: Patient[];
  }
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const titlesMap = {
    participantes: 'RELATÓRIO DE PARTICIPANTES POR EVENTO',
    evolucao: 'RELATÓRIO DE METAS E EVOLUÇÕES',
    financeiro: 'DEMONSTRATIVO FINANCEIRO E DRE',
    agenda: 'RELATÓRIO DE AGENDAMENTOS E CONSULTAS',
    frequencia: 'CONTROLE DE FREQUÊNCIA E LISTA DE PRESENÇA'
  };

  addPDFHeader(doc, titlesMap[reportType], clinicName);
  addPDFFooter(doc, 1);

  let currentY = 35;

  if (reportType === 'participantes') {
    const regs = (data.clinicRegs || []).filter(r => r.eventId === data.selectedEventId);
    const event = data.events?.find(e => e.id === data.selectedEventId);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(`Evento Selecionado: ${event?.name || 'Evento de Teste'}`, 15, currentY);
    currentY += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Data do Evento: ${event ? formatDate(event.date) : 'N/A'} • Tema: ${event?.theme || 'N/A'}`, 15, currentY);
    currentY += 8;

    // Table Header
    doc.setFillColor(241, 245, 249);
    doc.rect(15, currentY, 180, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text('Paciente (Criança)', 17, currentY + 4.5);
    doc.text('Responsável', 75, currentY + 4.5);
    doc.text('Data Insc.', 125, currentY + 4.5);
    doc.text('Status Financeiro', 155, currentY + 4.5);
    currentY += 10;

    if (regs.length === 0) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184);
      doc.text('Nenhuma inscrição efetuada para este evento até o momento.', 15, currentY);
    } else {
      regs.forEach((reg) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(30, 41, 59);
        
        doc.text(reg.childName, 17, currentY);
        doc.text(reg.parentName, 75, currentY);
        doc.text(formatDate(reg.date), 125, currentY);
        doc.text(reg.status, 155, currentY);
        
        currentY += 6;
      });
    }
  } 
  
  else if (reportType === 'evolucao') {
    const patient = data.patients?.find(p => p.id === data.selectedPatientId);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(`Paciente Selecionado: ${patient?.name || 'Nenhum paciente selecionado'}`, 15, currentY);
    currentY += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`CPF: ${patient?.cpf || 'N/A'} • Diagnóstico: ${patient?.diagnosis || 'Sem diagnóstico'}`, 15, currentY);
    currentY += 10;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 118, 110);
    doc.text('METAS TERAPÊUTICAS ALCANÇADAS (Junho 2026):', 15, currentY);
    currentY += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text('1. Deambulação Segura com apoio assistido (+40% de progresso)', 20, currentY);
    currentY += 5;
    doc.text('2. Coordenação de pinça fina e pegada em slimes (+15% de progresso)', 20, currentY);
    currentY += 5;
    doc.text('3. Autocontrole motor de membros superiores com simulação compartilhada (+30% de progresso)', 20, currentY);
    currentY += 10;

    doc.setFont('helvetica', 'bold');
    doc.text('DIRETRIZES DE PRÁTICA CLÍNICA:', 15, currentY);
    currentY += 5;
    doc.setFont('helvetica', 'normal');
    const guidelines = doc.splitTextToSize('Estimular força proximal e preensão com pistas lúdicas de repetição. Manter controle motor assistido durante exercícios de pranchas e cama elástica.', 175);
    doc.text(guidelines, 15, currentY);
  } 
  
  else if (reportType === 'financeiro') {
    const txs = data.clinicTx || [];
    const totalIncomes = txs.filter(t => t.type === 'Receita').reduce((sum, t) => sum + t.value, 0);
    const totalExpenses = txs.filter(t => t.type === 'Despesa').reduce((sum, t) => sum + t.value, 0);
    const netIncome = totalIncomes - totalExpenses;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('DEMONSTRATIVO DE FLUXO DE CAIXA E DRE CONSOLIDADO', 15, currentY);
    currentY += 8;

    // Financial KPI Summary Card
    doc.setFillColor(248, 250, 252);
    doc.rect(15, currentY, 180, 20, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(15, currentY, 180, 20);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text('Receitas Consolidadas', 20, currentY + 6);
    doc.text('Despesas Consolidadas', 80, currentY + 6);
    doc.text('Resultado Líquido', 140, currentY + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(16, 185, 129); // green
    doc.text(`R$ ${totalIncomes.toLocaleString('pt-BR')}`, 20, currentY + 13);
    
    doc.setTextColor(239, 68, 68); // red
    doc.text(`R$ ${totalExpenses.toLocaleString('pt-BR')}`, 80, currentY + 13);
    
    doc.setTextColor(15, 118, 110); // teal
    doc.text(`R$ ${netIncome.toLocaleString('pt-BR')}`, 140, currentY + 13);
    currentY += 28;

    // Breakdown tables
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);
    doc.text('ESTRUTURA DETALHADA DAS TRANSAÇÕES', 15, currentY);
    currentY += 5;

    // Table Headers
    doc.setFillColor(241, 245, 249);
    doc.rect(15, currentY, 180, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text('Data', 17, currentY + 4.5);
    doc.text('Tipo', 40, currentY + 4.5);
    doc.text('Categoria', 65, currentY + 4.5);
    doc.text('Descrição', 105, currentY + 4.5);
    doc.text('Valor (R$)', 165, currentY + 4.5);
    currentY += 10;

    txs.forEach((tx) => {
      // Check for page overflow
      if (currentY > 260) {
        doc.addPage();
        addPDFHeader(doc, titlesMap[reportType], clinicName);
        addPDFFooter(doc, 2);
        currentY = 35;
      }

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(51, 65, 85);

      doc.text(formatDate(tx.date), 17, currentY);
      
      doc.setFont('helvetica', 'bold');
      if (tx.type === 'Receita') {
        doc.setTextColor(16, 185, 129);
        doc.text('RECEITA', 40, currentY);
      } else {
        doc.setTextColor(239, 68, 68);
        doc.text('DESPESA', 40, currentY);
      }
      doc.setTextColor(51, 65, 85);
      doc.setFont('helvetica', 'normal');

      doc.text(tx.category, 65, currentY);
      doc.text(tx.description.substring(0, 32), 105, currentY);
      
      doc.setFont('helvetica', 'bold');
      doc.text(tx.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 }), 165, currentY);
      currentY += 5.5;
    });
  } 
  
  else if (reportType === 'agenda') {
    const apps = data.clinicApps || [];

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(30, 41, 59);
    doc.text('CONSOLIDADO DE CONSULTAS E ATENDIMENTOS AGENDADOS', 15, currentY);
    currentY += 8;

    // Headers
    doc.setFillColor(241, 245, 249);
    doc.rect(15, currentY, 180, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text('Data / Hora', 17, currentY + 4.5);
    doc.text('Paciente / Criança', 55, currentY + 4.5);
    doc.text('Especialidade', 105, currentY + 4.5);
    doc.text('Valor', 155, currentY + 4.5);
    doc.text('Status', 175, currentY + 4.5);
    currentY += 10;

    apps.forEach((app) => {
      if (currentY > 260) {
        doc.addPage();
        addPDFHeader(doc, titlesMap[reportType], clinicName);
        addPDFFooter(doc, 2);
        currentY = 35;
      }

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);

      doc.text(`${formatDate(app.date)} às ${app.time}`, 17, currentY);
      doc.setFont('helvetica', 'bold');
      doc.text(app.patientName, 55, currentY);
      doc.setFont('helvetica', 'normal');
      doc.text(app.type, 105, currentY);
      doc.text(`R$ ${app.price.toLocaleString('pt-BR')}`, 155, currentY);
      doc.text(app.status, 175, currentY);

      currentY += 6;
    });
  } 
  
  else if (reportType === 'frequencia') {
    const atts = data.attendances || [];

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(30, 41, 59);
    doc.text('TAXA DE PRESENÇA EM EVENTOS TERAPÊUTICOS PEDIÁTRICOS', 15, currentY);
    currentY += 8;

    // Headers
    doc.setFillColor(241, 245, 249);
    doc.rect(15, currentY, 180, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text('Paciente (Criança)', 17, currentY + 4.5);
    doc.text('Evento Clínico', 70, currentY + 4.5);
    doc.text('Presença', 135, currentY + 4.5);
    doc.text('Observações', 160, currentY + 4.5);
    currentY += 10;

    atts.forEach((att) => {
      if (currentY > 260) {
        doc.addPage();
        addPDFHeader(doc, titlesMap[reportType], clinicName);
        addPDFFooter(doc, 2);
        currentY = 35;
      }

      const patient = data.patients?.find(p => p.id === att.patientId);
      const ev = data.events?.find(e => e.id === att.eventId);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);

      doc.setFont('helvetica', 'bold');
      doc.text(patient?.name || 'Paciente Semente', 17, currentY);
      doc.setFont('helvetica', 'normal');
      doc.text(ev?.name || 'Evento de Teste', 70, currentY);
      
      doc.setFont('helvetica', 'bold');
      if (att.present) {
        doc.setTextColor(16, 185, 129);
        doc.text('PRESENTE', 135, currentY);
      } else {
        doc.setTextColor(239, 68, 68);
        doc.text('AUSENTE', 135, currentY);
      }
      doc.setTextColor(51, 65, 85);
      doc.setFont('helvetica', 'normal');

      doc.text(att.notes ? att.notes.substring(0, 20) : '-', 160, currentY);

      currentY += 6;
    });
  }

  doc.save(`relatorio_${reportType}_${new Date().toISOString().substring(0, 10)}.pdf`);
}

/**
 * EXPORT 4: CLINICAL REPORTS EXCEL EXPORT (USING SHEETJS)
 */
export function exportReportExcel(
  reportType: 'participantes' | 'evolucao' | 'financeiro' | 'agenda' | 'frequencia',
  clinicName: string,
  data: {
    clinicRegs?: Registration[];
    clinicPatients?: Patient[];
    clinicTx?: FinancialTransaction[];
    clinicApps?: Appointment[];
    attendances?: Attendance[];
    selectedEventId?: string;
    selectedPatientId?: string;
    events?: TherapeuticEvent[];
    patients?: Patient[];
  }
) {
  let exportData: any[] = [];
  let sheetName = 'Relatório';

  if (reportType === 'participantes') {
    const regs = (data.clinicRegs || []).filter(r => r.eventId === data.selectedEventId);
    const event = data.events?.find(e => e.id === data.selectedEventId);
    
    sheetName = 'Inscritos por Evento';
    exportData = regs.map(r => ({
      'Código Matrícula': r.registrationNumber,
      'Evento': event?.name || 'Evento de Teste',
      'Data Evento': event ? formatDate(event.date) : '',
      'Criança (Nome)': r.childName,
      'Responsável (Nome)': r.parentName,
      'Data Inscrição': formatDate(r.date),
      'Idade Calculada': `${r.ageCalculated} anos`,
      'Status': r.status,
      'Comprovante Financeiro': r.paymentReceiptName
    }));
  } 
  
  else if (reportType === 'evolucao') {
    const patient = data.patients?.find(p => p.id === data.selectedPatientId);
    sheetName = 'Evolução e Metas';
    exportData = [
      {
        'Clínica': clinicName,
        'Paciente': patient?.name || '',
        'Data Nascimento': patient ? formatDate(patient.birthDate) : '',
        'CPF': patient?.cpf || '',
        'Diagnóstico': patient?.diagnosis || '',
        'Limitações': patient?.limitations || '',
        'Meta de Deambulação': 'Alcançado (+40%)',
        'Meta de Coordenação Fina': 'Alcançado (+15%)',
        'Interações Sociais': 'Pendente de Progresso',
        'Medicamentos': patient?.medications || '',
        'Anotações Adicionais': patient?.notes || ''
      }
    ];
  } 
  
  else if (reportType === 'financeiro') {
    const txs = data.clinicTx || [];
    sheetName = 'DRE Financeiro';
    exportData = txs.map(t => ({
      'ID Transação': t.id,
      'Tipo': t.type,
      'Categoria': t.category,
      'Valor (R$)': t.value,
      'Data de Lançamento': formatDate(t.date),
      'Descrição': t.description,
      'Clínica Emissora': clinicName
    }));

    // Add summary row at the end
    const totalIncomes = txs.filter(t => t.type === 'Receita').reduce((sum, t) => sum + t.value, 0);
    const totalExpenses = txs.filter(t => t.type === 'Despesa').reduce((sum, t) => sum + t.value, 0);
    exportData.push({});
    exportData.push({
      'Tipo': 'SOMA RECEITAS',
      'Valor (R$)': totalIncomes,
      'Descrição': 'Todas as receitas consolidadas do mês'
    });
    exportData.push({
      'Tipo': 'SOMA DESPESAS',
      'Valor (R$)': totalExpenses,
      'Descrição': 'Todas as deduções consolidadas do mês'
    });
    exportData.push({
      'Tipo': 'LUCRO LÍQUIDO',
      'Valor (R$)': totalIncomes - totalExpenses,
      'Descrição': 'Resultado operacional consolidado do caixa'
    });
  } 
  
  else if (reportType === 'agenda') {
    const apps = data.clinicApps || [];
    sheetName = 'Agenda Clínica';
    exportData = apps.map(a => ({
      'Data Atendimento': formatDate(a.date),
      'Hora': a.time,
      'Paciente': a.patientName,
      'Especialidade / Sessão': a.type,
      'Preço da Consulta (R$)': a.price,
      'Status Agendamento': a.status
    }));
  } 
  
  else if (reportType === 'frequencia') {
    const atts = data.attendances || [];
    sheetName = 'Frequência do Mês';
    exportData = atts.map(a => {
      const patient = data.patients?.find(p => p.id === a.patientId);
      const ev = data.events?.find(e => e.id === a.eventId);
      return {
        'Paciente': patient?.name || 'Paciente Semente',
        'Evento Clínico': ev?.name || 'Evento de Teste',
        'Data': ev ? formatDate(ev.date) : '',
        'Presença / Check-in': a.present ? 'PRESENTE' : 'AUSENTE',
        'Observações Clínicas': a.notes || ''
      };
    });
  }

  // Create workbook and worksheet
  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Generate and download xlsx file
  XLSX.writeFile(workbook, `relatorio_${reportType}_${new Date().toISOString().substring(0, 10)}.xlsx`);
}
