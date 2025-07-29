/**
 * Work Order and Log Management Utilities
 * Handles relationships between work orders and maintenance logs
 */

import { demoWorkOrders, demoPastLogs } from '../data/demoData';
import jsPDF from 'jspdf';
import { getOpenAIResponse, ContextualResponse } from './openai';

export interface WorkOrder {
  id: string;
  task: string;
  timeSpent: string;
  priority: string;
  location: string;
  asset: string;
  description: string;
  requestedBy: string;
  assignedTo: string;
  dueDate: string;
  status: string;
  steps: string;
  createdDate: string;
  createdBy: string;
  partsUsed: string;
  materials: string;
  comments: string;
  additionalNotes: string;
  machineId?: string;
  relatedLogId?: string;
}

export interface MaintenanceLog {
  id: string;
  date: string;
  summary: string;
  technician: string;
  duration: string;
  issues: string;
  machineId?: string;
  workOrderId?: string;
  priority?: string;
  type?: string;
  partsUsed?: string[];
  steps?: string[];
  recommendations?: string;
  cost?: string;
  followUpRequired?: boolean;
  followUpDate?: string;
}

/**
 * Find related log for a work order
 */
export const getRelatedLog = (workOrderId: string): MaintenanceLog | null => {
  const workOrder = demoWorkOrders.find(wo => wo.id === workOrderId);
  if (!workOrder?.relatedLogId) return null;
  
  return demoPastLogs.find(log => log.id === workOrder.relatedLogId) || null;
};

/**
 * Find related work order for a log
 */
export const getRelatedWorkOrder = (logId: string): WorkOrder | null => {
  const log = demoPastLogs.find(l => l.id === logId);
  if (!log?.workOrderId) return null;
  
  return demoWorkOrders.find(wo => wo.id === log.workOrderId) || null;
};

/**
 * Get all logs for a specific machine
 */
export const getLogsByMachine = (machineId: string): MaintenanceLog[] => {
  return demoPastLogs.filter(log => log.machineId === machineId);
};

/**
 * Get all work orders for a specific machine
 */
export const getWorkOrdersByMachine = (machineId: string): WorkOrder[] => {
  return demoWorkOrders.filter(wo => wo.machineId === machineId);
};

/**
 * Download individual log as PDF
 */
export const downloadLogPDF = (log: MaintenanceLog, language: 'en' | 'es' | 'fr' = 'en') => {
  const doc = new jsPDF();
  const translations = getLogTranslations(language);
  
  // Title
  doc.setFontSize(16);
  doc.text(translations.title, 10, 20);
  
  // Log ID and Date
  doc.setFontSize(12);
  doc.text(`${translations.logId}: ${log.id}`, 10, 35);
  doc.text(`${translations.date}: ${log.date}`, 10, 45);
  
  // Basic Information
  let yPos = 60;
  doc.text(`${translations.machineId}: ${log.machineId || 'N/A'}`, 10, yPos);
  yPos += 10;
  doc.text(`${translations.technician}: ${log.technician}`, 10, yPos);
  yPos += 10;
  doc.text(`${translations.duration}: ${log.duration}`, 10, yPos);
  yPos += 10;
  doc.text(`${translations.priority}: ${log.priority || 'N/A'}`, 10, yPos);
  yPos += 10;
  doc.text(`${translations.type}: ${log.type || 'N/A'}`, 10, yPos);
  yPos += 15;
  
  // Summary
  doc.text(`${translations.summary}:`, 10, yPos);
  yPos += 10;
  const summaryLines = doc.splitTextToSize(log.summary, 180);
  doc.text(summaryLines, 10, yPos);
  yPos += summaryLines.length * 5 + 10;
  
  // Issues
  doc.text(`${translations.issues}:`, 10, yPos);
  yPos += 10;
  const issueLines = doc.splitTextToSize(log.issues, 180);
  doc.text(issueLines, 10, yPos);
  yPos += issueLines.length * 5 + 10;
  
  // Parts Used
  if (log.partsUsed && log.partsUsed.length > 0) {
    doc.text(`${translations.partsUsed}:`, 10, yPos);
    yPos += 10;
    log.partsUsed.forEach(part => {
      doc.text(`• ${part}`, 15, yPos);
      yPos += 7;
    });
    yPos += 5;
  }
  
  // Steps Performed
  if (log.steps && log.steps.length > 0) {
    doc.text(`${translations.stepsPerformed}:`, 10, yPos);
    yPos += 10;
    log.steps.forEach((step, index) => {
      const stepLines = doc.splitTextToSize(`${index + 1}. ${step}`, 175);
      doc.text(stepLines, 15, yPos);
      yPos += stepLines.length * 5 + 3;
    });
    yPos += 5;
  }
  
  // Recommendations
  if (log.recommendations) {
    doc.text(`${translations.recommendations}:`, 10, yPos);
    yPos += 10;
    const recLines = doc.splitTextToSize(log.recommendations, 180);
    doc.text(recLines, 10, yPos);
    yPos += recLines.length * 5 + 10;
  }
  
  // Cost and Follow-up
  if (log.cost) {
    doc.text(`${translations.cost}: ${log.cost}`, 10, yPos);
    yPos += 10;
  }
  
  if (log.followUpRequired) {
    doc.text(`${translations.followUpRequired}: ${translations.yes}`, 10, yPos);
    yPos += 7;
    if (log.followUpDate) {
      doc.text(`${translations.followUpDate}: ${log.followUpDate}`, 10, yPos);
    }
  }
  
  // Save the PDF
  doc.save(`maintenance-log-${log.id}.pdf`);
};

/**
 * Generate AI report for work order and related log
 */
export const generateAIReport = async (
  workOrder: WorkOrder, 
  log: MaintenanceLog | null, 
  language: 'en' | 'es' | 'fr' = 'en'
): Promise<string> => {
  const translations = getReportTranslations(language);
  
  // Prepare context for AI
  const context = {
    sessionId: `report-${Date.now()}`,
    selectedMachine: workOrder.machineId,
    activeWorkOrder: workOrder.id,
    currentIssue: workOrder.description,
    troubleshootingStep: 0
  };
  
  // Create detailed prompt for AI report generation
  const reportPrompt = createReportPrompt(workOrder, log, language);
  
  try {
    // Get AI-generated report
    const response = await getOpenAIResponse(reportPrompt, [], context);
    return response.text;
  } catch (error) {
    console.error('Error generating AI report:', error);
    return generateFallbackReport(workOrder, log, language);
  }
};

/**
 * Download AI-generated report as PDF
 */
export const downloadAIReportPDF = (
  reportContent: string, 
  workOrder: WorkOrder, 
  language: 'en' | 'es' | 'fr' = 'en'
) => {
  const doc = new jsPDF();
  const translations = getReportTranslations(language);
  
  // Title
  doc.setFontSize(16);
  doc.text(translations.title, 10, 20);
  
  // Work Order Info
  doc.setFontSize(12);
  doc.text(`${translations.workOrderId}: ${workOrder.id}`, 10, 35);
  doc.text(`${translations.generatedDate}: ${new Date().toLocaleDateString()}`, 10, 45);
  
  // AI Report Content
  doc.setFontSize(10);
  const lines = doc.splitTextToSize(reportContent, 190);
  let yPos = 60;
  
  lines.forEach((line: string) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
    doc.text(line, 10, yPos);
    yPos += 5;
  });
  
  // Save the PDF
  doc.save(`ai-report-${workOrder.id}-${Date.now()}.pdf`);
};

/**
 * Create detailed prompt for AI report generation
 */
const createReportPrompt = (
  workOrder: WorkOrder, 
  log: MaintenanceLog | null, 
  language: 'en' | 'es' | 'fr'
): string => {
  const languageInstruction = {
    en: "Generate this report in English.",
    es: "Genera este reporte en español.",
    fr: "Générez ce rapport en français."
  }[language];

  return `${languageInstruction}

Generate a comprehensive maintenance analysis report based on the following data:

**WORK ORDER INFORMATION:**
- ID: ${workOrder.id}
- Task: ${workOrder.task}
- Priority: ${workOrder.priority}
- Status: ${workOrder.status}
- Machine: ${workOrder.asset}
- Location: ${workOrder.location}
- Description: ${workOrder.description}
- Requested By: ${workOrder.requestedBy}
- Assigned To: ${workOrder.assignedTo}
- Due Date: ${workOrder.dueDate}
- Steps: ${workOrder.steps}

${log ? `
**RELATED MAINTENANCE LOG:**
- Log ID: ${log.id}
- Date: ${log.date}
- Technician: ${log.technician}
- Duration: ${log.duration}
- Issues: ${log.issues}
- Type: ${log.type || 'N/A'}
- Parts Used: ${log.partsUsed?.join(', ') || 'None'}
- Steps Performed: ${log.steps?.join(' | ') || 'N/A'}
- Recommendations: ${log.recommendations || 'None'}
- Cost: ${log.cost || 'N/A'}
- Follow-up Required: ${log.followUpRequired ? 'Yes' : 'No'}
` : '**No related maintenance log available**'}

Please provide a detailed analysis report including:
1. Executive Summary
2. Issue Analysis and Root Cause
3. Actions Taken and Results
4. Cost Analysis
5. Recommendations for Future Prevention
6. Follow-up Actions Required
7. Performance Metrics and Insights

Make the report professional, comprehensive, and actionable for maintenance management.`;
};

/**
 * Generate fallback report when AI is unavailable
 */
const generateFallbackReport = (
  workOrder: WorkOrder, 
  log: MaintenanceLog | null, 
  language: 'en' | 'es' | 'fr'
): string => {
  const translations = getReportTranslations(language);
  
  return `${translations.title}

${translations.workOrderId}: ${workOrder.id}
${translations.generatedDate}: ${new Date().toLocaleDateString()}

${translations.executiveSummary}
${translations.fallbackSummary}

${translations.workOrderDetails}:
• ${translations.task}: ${workOrder.task}
• ${translations.priority}: ${workOrder.priority}
• ${translations.status}: ${workOrder.status}
• ${translations.machine}: ${workOrder.asset}
• ${translations.description}: ${workOrder.description}

${log ? `
${translations.maintenanceResults}:
• ${translations.technician}: ${log.technician}
• ${translations.duration}: ${log.duration}
• ${translations.issues}: ${log.issues}
• ${translations.cost}: ${log.cost || 'N/A'}

${log.recommendations ? `${translations.recommendations}: ${log.recommendations}` : ''}
` : translations.noLogData}

${translations.nextSteps}
${translations.fallbackNextSteps}`;
};

/**
 * Get translations for log PDF
 */
const getLogTranslations = (language: 'en' | 'es' | 'fr') => {
  const translations = {
    en: {
      title: 'Maintenance Log Report',
      logId: 'Log ID',
      date: 'Date',
      machineId: 'Machine ID',
      technician: 'Technician',
      duration: 'Duration',
      priority: 'Priority',
      type: 'Type',
      summary: 'Summary',
      issues: 'Issues',
      partsUsed: 'Parts Used',
      stepsPerformed: 'Steps Performed',
      recommendations: 'Recommendations',
      cost: 'Cost',
      followUpRequired: 'Follow-up Required',
      followUpDate: 'Follow-up Date',
      yes: 'Yes',
      no: 'No'
    },
    es: {
      title: 'Reporte de Registro de Mantenimiento',
      logId: 'ID de Registro',
      date: 'Fecha',
      machineId: 'ID de Máquina',
      technician: 'Técnico',
      duration: 'Duración',
      priority: 'Prioridad',
      type: 'Tipo',
      summary: 'Resumen',
      issues: 'Problemas',
      partsUsed: 'Partes Utilizadas',
      stepsPerformed: 'Pasos Realizados',
      recommendations: 'Recomendaciones',
      cost: 'Costo',
      followUpRequired: 'Seguimiento Requerido',
      followUpDate: 'Fecha de Seguimiento',
      yes: 'Sí',
      no: 'No'
    },
    fr: {
      title: 'Rapport de Journal de Maintenance',
      logId: 'ID du Journal',
      date: 'Date',
      machineId: 'ID de Machine',
      technician: 'Technicien',
      duration: 'Durée',
      priority: 'Priorité',
      type: 'Type',
      summary: 'Résumé',
      issues: 'Problèmes',
      partsUsed: 'Pièces Utilisées',
      stepsPerformed: 'Étapes Effectuées',
      recommendations: 'Recommandations',
      cost: 'Coût',
      followUpRequired: 'Suivi Requis',
      followUpDate: 'Date de Suivi',
      yes: 'Oui',
      no: 'Non'
    }
  };
  
  return translations[language];
};

/**
 * Get translations for AI report
 */
const getReportTranslations = (language: 'en' | 'es' | 'fr') => {
  const translations = {
    en: {
      title: 'AI-Generated Maintenance Analysis Report',
      workOrderId: 'Work Order ID',
      generatedDate: 'Generated Date',
      executiveSummary: 'Executive Summary',
      fallbackSummary: 'This maintenance report provides a comprehensive analysis of the work order and related maintenance activities.',
      workOrderDetails: 'Work Order Details',
      task: 'Task',
      priority: 'Priority',
      status: 'Status',
      machine: 'Machine',
      description: 'Description',
      maintenanceResults: 'Maintenance Results',
      technician: 'Technician',
      duration: 'Duration',
      issues: 'Issues Resolved',
      cost: 'Total Cost',
      recommendations: 'Recommendations',
      noLogData: 'No maintenance log data available for detailed analysis.',
      nextSteps: 'Next Steps',
      fallbackNextSteps: 'Continue monitoring system performance and schedule regular maintenance as recommended.'
    },
    es: {
      title: 'Reporte de Análisis de Mantenimiento Generado por IA',
      workOrderId: 'ID de Orden de Trabajo',
      generatedDate: 'Fecha de Generación',
      executiveSummary: 'Resumen Ejecutivo',
      fallbackSummary: 'Este reporte de mantenimiento proporciona un análisis integral de la orden de trabajo y actividades de mantenimiento relacionadas.',
      workOrderDetails: 'Detalles de la Orden de Trabajo',
      task: 'Tarea',
      priority: 'Prioridad',
      status: 'Estado',
      machine: 'Máquina',
      description: 'Descripción',
      maintenanceResults: 'Resultados del Mantenimiento',
      technician: 'Técnico',
      duration: 'Duración',
      issues: 'Problemas Resueltos',
      cost: 'Costo Total',
      recommendations: 'Recomendaciones',
      noLogData: 'No hay datos de registro de mantenimiento disponibles para análisis detallado.',
      nextSteps: 'Próximos Pasos',
      fallbackNextSteps: 'Continuar monitoreando el rendimiento del sistema y programar mantenimiento regular según se recomiende.'
    },
    fr: {
      title: 'Rapport d\'Analyse de Maintenance Généré par IA',
      workOrderId: 'ID de l\'Ordre de Travail',
      generatedDate: 'Date de Génération',
      executiveSummary: 'Résumé Exécutif',
      fallbackSummary: 'Ce rapport de maintenance fournit une analyse complète de l\'ordre de travail et des activités de maintenance associées.',
      workOrderDetails: 'Détails de l\'Ordre de Travail',
      task: 'Tâche',
      priority: 'Priorité',
      status: 'Statut',
      machine: 'Machine',
      description: 'Description',
      maintenanceResults: 'Résultats de Maintenance',
      technician: 'Technicien',
      duration: 'Durée',
      issues: 'Problèmes Résolus',
      cost: 'Coût Total',
      recommendations: 'Recommandations',
      noLogData: 'Aucune donnée de journal de maintenance disponible pour une analyse détaillée.',
      nextSteps: 'Prochaines Étapes',
      fallbackNextSteps: 'Continuer à surveiller les performances du système et planifier une maintenance régulière comme recommandé.'
    }
  };
  
  return translations[language];
};
