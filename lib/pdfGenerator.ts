import jsPDF from 'jspdf';
import { MedicalCertificate } from '@/types/medicalCertificate';

export class PDFGenerator {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number;

  constructor() {
    this.doc = new jsPDF('p', 'mm', 'a4');
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.margin = 20;
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    return `${day} de ${month} del ${year}`;
  }

  private addHeader(certificate: MedicalCertificate): number {
    let yPosition = this.margin;

    // Logo placeholder (puedes agregar un logo real aquí)
    this.doc.setFillColor(41, 128, 185);
    this.doc.circle(30, 30, 15, 'F');
    
    // Título del centro médico
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(41, 128, 185);
    
    const centerName = certificate.establishment_name.toUpperCase();
    this.doc.text(centerName, this.pageWidth / 2, yPosition + 10, { align: 'center' });
    
    yPosition += 20;
    
    // Ciudad y fecha
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(0, 0, 0);
    
    const location = certificate.establishment_address || 'Quito, Ecuador';
    const formattedDate = this.formatDate(certificate.issue_date);
    this.doc.text(`${location}, ${formattedDate}`, this.pageWidth / 2, yPosition + 5, { align: 'center' });
    
    yPosition += 20;
    
    // Título del certificado
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 0, 0);
    this.doc.text('CERTIFICADO MÉDICO', this.pageWidth / 2, yPosition + 10, { align: 'center' });
    
    return yPosition + 25;
  }

  private addPatientData(certificate: MedicalCertificate, yPosition: number): number {
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('1.- DATOS DEL PACIENTE:', this.margin, yPosition);
    
    yPosition += 10;
    
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');
    
    const patientData = [
      `Nombres y apellidos del paciente: ${certificate.patient_name}`,
      `Edad: ${certificate.patient_age} AÑO(S)`,
      `Dirección domiciliaria: ${certificate.patient_address || 'No especificada'}`,
      `Número telefónico de contacto: ${certificate.patient_phone || 'No especificado'}`,
      `Institución: ${certificate.patient_institution || 'No especificada'}`,
      `Ocupación: ${certificate.patient_occupation || 'No especificada'}`,
      `Número de cedula del paciente: ${certificate.patient_cedula || 'No especificada'}`,
      `Número de Historia Clínica: ${certificate.patient_clinical_history || 'No especificado'}`
    ];
    
    patientData.forEach(line => {
      this.doc.text(line, this.margin, yPosition);
      yPosition += 6;
    });
    
    return yPosition + 10;
  }

  private addDiseaseMotives(certificate: MedicalCertificate, yPosition: number): number {
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('2.- MOTIVOS DE LA ENFERMEDAD:', this.margin, yPosition);
    
    yPosition += 10;
    
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');
    
    const diseaseData = [
      `Diagnóstico: ${certificate.diagnosis}`,
      `CIE 10: ${certificate.cie_code || 'No especificado'}`,
      `Tipo de contingencia: ${certificate.contingency_type}`,
      `Reposo: ${certificate.rest_hours} (${this.numberToWords(certificate.rest_hours)}) horas, ${certificate.rest_days} (${this.numberToWords(certificate.rest_days)}) día(s)`,
      `Desde: ${this.formatDate(certificate.rest_from_date)}`,
      `Hasta: ${this.formatDate(certificate.rest_to_date)}`
    ];
    
    diseaseData.forEach(line => {
      const lines = this.doc.splitTextToSize(line, this.pageWidth - 2 * this.margin);
      lines.forEach((splitLine: string) => {
        this.doc.text(splitLine, this.margin, yPosition);
        yPosition += 6;
      });
    });
    
    return yPosition + 10;
  }

  private addResponsibilitySignature(certificate: MedicalCertificate, yPosition: number): number {
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('3.- FIRMA DE RESPONSABILIDAD:', this.margin, yPosition);
    
    yPosition += 10;
    
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');
    
    const doctorData = [
      `Nombre del profesional emisor: ${certificate.doctor_name}`,
      `Número de cédula del profesional emisor: ${certificate.doctor_cedula}`,
      `Especialidad del profesional de la salud: ${certificate.doctor_specialty}`,
      `Correo electrónico: ${certificate.doctor_email || 'No especificado'}`
    ];
    
    doctorData.forEach(line => {
      this.doc.text(line, this.margin, yPosition);
      yPosition += 6;
    });
    
    return yPosition + 20;
  }

  private addSignatureSection(certificate: MedicalCertificate, yPosition: number): number {
    // Sello del establecimiento (círculo placeholder)
    const sealX = this.pageWidth - 60;
    const sealY = yPosition + 20;
    
    this.doc.setDrawColor(0, 0, 0);
    this.doc.setLineWidth(2);
    this.doc.circle(sealX, sealY, 25, 'S');
    
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(certificate.establishment_name.toUpperCase(), sealX, sealY - 5, { align: 'center' });
    this.doc.text('SELLO DEL ESTABLECIMIENTO', sealX, sealY + 5, { align: 'center' });
    
    // Líneas de firma
    const signatureY = yPosition + 60;
    
    // Línea firma profesional
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, signatureY, this.margin + 60, signatureY);
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Firma y Sello Profesional.', this.margin + 30, signatureY + 8, { align: 'center' });
    
    // Línea sello establecimiento
    this.doc.line(this.pageWidth - this.margin - 60, signatureY, this.pageWidth - this.margin, signatureY);
    this.doc.text('Sello del Establecimiento de Salud.', this.pageWidth - this.margin - 30, signatureY + 8, { align: 'center' });
    
    return signatureY + 20;
  }

  private addFooter(certificate: MedicalCertificate): void {
    const footerY = this.pageHeight - 30;
    
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(100, 100, 100);
    
    const footerText = `${certificate.establishment_address || ''} ${certificate.establishment_phone ? `Telf: ${certificate.establishment_phone}` : ''}`;
    this.doc.text(footerText, this.pageWidth / 2, footerY, { align: 'center' });
    
    // Número de certificado
    this.doc.setFontSize(8);
    this.doc.text(`N° Certificado: ${certificate.certificate_number}`, this.pageWidth - this.margin, footerY + 5, { align: 'right' });
  }

  private numberToWords(num: number): string {
    const ones = [
      '', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve',
      'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete',
      'dieciocho', 'diecinueve', 'veinte'
    ];
    
    const tens = [
      '', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'
    ];
    
    if (num <= 20) {
      return ones[num];
    } else if (num < 100) {
      const ten = Math.floor(num / 10);
      const one = num % 10;
      return tens[ten] + (one > 0 ? ' y ' + ones[one] : '');
    }
    
    return num.toString();
  }

  public generateCertificate(certificate: MedicalCertificate): jsPDF {
    let yPosition = this.addHeader(certificate);
    yPosition = this.addPatientData(certificate, yPosition);
    yPosition = this.addDiseaseMotives(certificate, yPosition);
    yPosition = this.addResponsibilitySignature(certificate, yPosition);
    yPosition = this.addSignatureSection(certificate, yPosition);
    this.addFooter(certificate);
    
    return this.doc;
  }

  public downloadPDF(certificate: MedicalCertificate, filename?: string): void {
    this.generateCertificate(certificate);
    const fileName = filename || `certificado-medico-${certificate.certificate_number}.pdf`;
    this.doc.save(fileName);
  }

  public getPDFBlob(certificate: MedicalCertificate): Blob {
    this.generateCertificate(certificate);
    return this.doc.output('blob');
  }
}

export const pdfGenerator = new PDFGenerator();
