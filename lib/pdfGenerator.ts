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
    // Círculo azul en la esquina superior izquierda (como logo)
    this.doc.setFillColor(41, 128, 185);
    this.doc.circle(30, 18, 10, 'F');
    
    // Nombre del establecimiento - alineado a la derecha del círculo
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(41, 128, 185);
    const establishmentName = certificate.establishment_name.toUpperCase();
    this.doc.text(establishmentName, 45, 15, { maxWidth: this.pageWidth - 50 });
    
    // Dirección - centrada debajo del nombre
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(0, 0, 0);
    const location = certificate.establishment_address || 'Alejandro Callisto E4-224';
    const formattedDate = this.formatDate(certificate.issue_date);
    this.doc.text(`${location}, ${formattedDate}`, this.pageWidth / 2, 23, { align: 'center' });
    
    let yPosition = 35;
    
    // Título del certificado
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 0, 0);
    this.doc.text('CERTIFICADO MÉDICO', this.pageWidth / 2, yPosition, { align: 'center' });
    
    return yPosition + 15;
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
    yPosition += 10; // Reducido de 30 a 10 para subir el sello
    
    // Sello del establecimiento (círculo grande en el centro-derecha)
    const sealX = this.pageWidth - 55;
    const sealY = yPosition + 5; // Reducido de 10 a 5
    const sealRadius = 28;
    
    // Dibujar círculo del sello con línea más gruesa
    this.doc.setDrawColor(0, 0, 0);
    this.doc.setLineWidth(2);
    this.doc.circle(sealX, sealY, sealRadius, 'S');
    
    // Texto dentro del sello
    this.doc.setFontSize(7);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(0, 0, 0);
    
    // Número de certificado (arriba)
    const certNumber = `N° Certificado:`;
    const certNumberValue = certificate.certificate_number;
    this.doc.text(certNumber, sealX, sealY - 12, { align: 'center', maxWidth: sealRadius * 1.6 });
    this.doc.text(certNumberValue, sealX, sealY - 7, { align: 'center', maxWidth: sealRadius * 1.6 });
    
    // Nombre del establecimiento (centro) - dividido en líneas
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(8);
    const establishmentNameLines = this.doc.splitTextToSize(
      certificate.establishment_name.toUpperCase(),
      sealRadius * 1.6
    );
    
    let nameY = sealY - 2;
    if (establishmentNameLines.length === 1) {
      this.doc.text(establishmentNameLines[0], sealX, nameY, { align: 'center' });
    } else {
      establishmentNameLines.forEach((line: string, index: number) => {
        this.doc.text(line, sealX, nameY + (index * 3.5), { align: 'center' });
      });
    }
    
    // "SELLO DEL ESTABLECIMIENTO" (abajo)
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(7);
    this.doc.text('SELLO DEL', sealX, sealY + 10, { align: 'center' });
    this.doc.text('ESTABLECIMIENTO', sealX, sealY + 14, { align: 'center' });
    
    return yPosition + 50;
  }

  private addFooter(certificate: MedicalCertificate): void {
    // Footer con fondo azul
    this.doc.setFillColor(41, 128, 185);
    this.doc.rect(0, this.pageHeight - 20, this.pageWidth, 20, 'F');
    
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(8);
    this.doc.setTextColor(255, 255, 255);
    
    const address = certificate.establishment_address || 'Alejandro Callisto E4-224';
    const phone = certificate.establishment_phone || 'Telf: 02 282 2015 – 093 937 2744';
    const footerText = `${address} ${phone}`;
    
    this.doc.text(footerText, this.pageWidth / 2, this.pageHeight - 10, { align: 'center' });
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

// Función de conveniencia para generar y descargar un certificado médico
export const generateMedicalCertificatePDF = async (certificate: MedicalCertificate): Promise<void> => {
  const generator = new PDFGenerator();
  generator.downloadPDF(certificate);
};
