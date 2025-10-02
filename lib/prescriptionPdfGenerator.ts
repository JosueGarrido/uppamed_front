import jsPDF from 'jspdf';
import { MedicalPrescription } from '@/types/medicalPrescription';

export class PrescriptionPDFGenerator {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number;
  private currentY: number;

  constructor() {
    this.doc = new jsPDF('p', 'mm', 'a4');
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.margin = 20;
    this.currentY = this.margin;
  }

  private formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  }

  private addHeader(prescription: MedicalPrescription) {
    // Círculo azul en la esquina superior izquierda (más pequeño, como logo)
    this.doc.setFillColor(41, 128, 185);
    this.doc.circle(30, 18, 10, 'F');
    
    // Nombre del establecimiento - en una línea, empezando después del círculo
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(41, 128, 185);
    const establishmentName = prescription.establishment_name.toUpperCase();
    // Texto empieza después del círculo (margen 45mm)
    this.doc.text(establishmentName, 45, 15, { maxWidth: this.pageWidth - 50 });
    
    // Servicios/Especialidades - debajo del nombre, alineado igual
    this.doc.setFontSize(7);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(100, 100, 100);
    const services = 'Medicina General - Odontología - Laboratorio Clínico - Rayos X - Ecografía - Farmacia - Especialidades Médicas y Odontológicas';
    this.doc.text(services, 45, 20, { maxWidth: this.pageWidth - 50 });
    
    this.currentY = 35;
  }

  private addPatientInfo(prescription: MedicalPrescription) {
    // Tabla de información del paciente
    const startY = this.currentY;
    const rowHeight = 7;
    const col1Width = 40;
    const col2Width = this.pageWidth - this.margin * 2 - col1Width;
    
    // Configurar estilos
    this.doc.setFillColor(240, 240, 240);
    this.doc.setDrawColor(200, 200, 200);
    this.doc.setLineWidth(0.1);
    
    const rows = [
      ['Nombre', prescription.patient_name],
      ['Edad', `${prescription.patient_age} AÑOS`],
      ['Cédula', prescription.patient_cedula || ''],
      ['Ciudad', prescription.patient_city || ''],
      ['Fecha', this.formatDate(prescription.issue_date)],
      ['RECETA #', prescription.prescription_number]
    ];
    
    rows.forEach((row, index) => {
      const y = startY + (index * rowHeight);
      
      // Columna 1 (label)
      this.doc.rect(this.margin, y, col1Width, rowHeight);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setFontSize(9);
      this.doc.setTextColor(60, 60, 60);
      this.doc.text(row[0], this.margin + 2, y + 5);
      
      // Columna 2 (value)
      this.doc.rect(this.margin + col1Width, y, col2Width, rowHeight);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(40, 40, 40);
      this.doc.text(row[1], this.margin + col1Width + 2, y + 5);
    });
    
    this.currentY = startY + (rows.length * rowHeight) + 10;
  }

  private addSectionTitle(title: string) {
    this.doc.setFillColor(41, 128, 185);
    this.doc.rect(this.margin, this.currentY, this.pageWidth - this.margin * 2, 8, 'F');
    
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(10);
    this.doc.setTextColor(255, 255, 255);
    this.doc.text(title, this.margin + 2, this.currentY + 5.5);
    
    this.currentY += 12; // Aumentado de 10 a 12 para más espacio
  }

  private addMedications(prescription: MedicalPrescription) {
    this.addSectionTitle('Rp.');
    
    this.currentY += 2; // Espacio adicional después del título
    
    prescription.medications.forEach((medication, index) => {
      // Nombre del medicamento
      this.doc.setFont('helvetica', 'bold');
      this.doc.setFontSize(10);
      this.doc.setTextColor(40, 40, 40);
      this.doc.text(medication.name, this.margin + 5, this.currentY);
      this.currentY += 5;
      
      // Cantidad
      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(9);
      this.doc.setTextColor(80, 80, 80);
      this.doc.text(`CANTIDAD: ${medication.quantity} (${medication.quantity_text})`, this.margin + 10, this.currentY);
      this.currentY += 5;
      
      // Indicaciones del medicamento (si existen)
      if (medication.instructions) {
        this.doc.setFont('helvetica', 'italic');
        this.doc.setFontSize(9);
        this.doc.setTextColor(100, 100, 100);
        const lines = this.doc.splitTextToSize(medication.instructions, this.pageWidth - this.margin * 2 - 15);
        this.doc.text(lines, this.margin + 10, this.currentY);
        this.currentY += lines.length * 4 + 2;
      }
      
      this.currentY += 3;
    });
    
    this.currentY += 5;
  }

  private addDiagnosisAndAllergies(prescription: MedicalPrescription) {
    // Diagnóstico
    this.addSectionTitle(`CIE 10: ${prescription.cie_code || 'N/A'}`);
    
    this.currentY += 2; // Espacio adicional después del título
    
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(9);
    this.doc.setTextColor(40, 40, 40);
    const diagnosisLines = this.doc.splitTextToSize(prescription.diagnosis || '', this.pageWidth - this.margin * 2 - 10);
    this.doc.text(diagnosisLines, this.margin + 5, this.currentY);
    this.currentY += diagnosisLines.length * 5 + 10; // Más espacio antes de alergias
    
    // Antecedentes de alergias
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(9);
    this.doc.setTextColor(60, 60, 60);
    this.doc.text('ANTECEDENTES DE ALERGIAS:', this.margin, this.currentY);
    this.currentY += 5;
    
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(40, 40, 40);
    const allergyText = prescription.allergy_history || 'NO REFIERE';
    const allergyLines = this.doc.splitTextToSize(allergyText, this.pageWidth - this.margin * 2 - 10);
    this.doc.text(allergyLines, this.margin + 5, this.currentY);
    this.currentY += allergyLines.length * 5 + 8;
  }

  private addRecommendations(prescription: MedicalPrescription) {
    if (!prescription.non_pharmacological_recommendations) return;
    
    this.addSectionTitle('RECOMENDACIONES NO FARMACOLÓGICAS:');
    
    this.currentY += 2; // Espacio adicional después del título
    
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(9);
    this.doc.setTextColor(40, 40, 40);
    const lines = this.doc.splitTextToSize(
      prescription.non_pharmacological_recommendations,
      this.pageWidth - this.margin * 2 - 10
    );
    this.doc.text(lines, this.margin + 5, this.currentY);
    this.currentY += lines.length * 5 + 8;
  }

  private addNextAppointment(prescription: MedicalPrescription) {
    if (!prescription.next_appointment_date) return;
    
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(9);
    this.doc.setTextColor(60, 60, 60);
    this.doc.text('Próxima Cita:', this.margin, this.currentY);
    this.currentY += 5;
    
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(40, 40, 40);
    const appointmentDate = this.formatDate(prescription.next_appointment_date);
    const appointmentTime = prescription.next_appointment_time ? ` a las ${prescription.next_appointment_time}` : '';
    this.doc.text(`${appointmentDate}${appointmentTime}`, this.margin + 5, this.currentY);
    this.currentY += 8;
  }

  private addFooter(prescription: MedicalPrescription) {
    // Línea de separación
    this.doc.setDrawColor(200, 200, 200);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    this.currentY += 8;
    
    // Información del médico
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(10);
    this.doc.setTextColor(41, 128, 185);
    this.doc.text(prescription.doctor_name, this.pageWidth / 2, this.currentY, { align: 'center' });
    this.currentY += 5;
    
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(9);
    this.doc.setTextColor(80, 80, 80);
    this.doc.text(`${prescription.doctor_specialty} - Cédula: ${prescription.doctor_cedula}`, this.pageWidth / 2, this.currentY, { align: 'center' });
    this.currentY += 5;
    
    if (prescription.doctor_email) {
      this.doc.text(prescription.doctor_email, this.pageWidth / 2, this.currentY, { align: 'center' });
      this.currentY += 5;
    }
    
    this.currentY += 5;
    
    // Información del establecimiento (footer)
    this.doc.setFillColor(41, 128, 185);
    this.doc.rect(0, this.pageHeight - 20, this.pageWidth, 20, 'F');
    
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(8);
    this.doc.setTextColor(255, 255, 255);
    
    const footerText = `${prescription.establishment_address || ''} | Tel: ${prescription.establishment_phone || ''} | RUC: ${prescription.establishment_ruc || ''}`;
    this.doc.text(footerText, this.pageWidth / 2, this.pageHeight - 10, { align: 'center' });
  }

  public generatePrescription(prescription: MedicalPrescription): jsPDF {
    this.addHeader(prescription);
    this.addPatientInfo(prescription);
    this.addMedications(prescription);
    this.addDiagnosisAndAllergies(prescription);
    this.addRecommendations(prescription);
    this.addNextAppointment(prescription);
    this.addFooter(prescription);
    
    return this.doc;
  }

  public downloadPDF(prescription: MedicalPrescription, filename?: string): void {
    this.generatePrescription(prescription);
    const name = filename || `Receta_${prescription.prescription_number}.pdf`;
    this.doc.save(name);
  }
}
