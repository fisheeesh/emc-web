import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from "sonner";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface DownloadPDFOptions {
  empName: string;
  weekRange?: string | number;
}

export const downloadAnalysisAsPDF = async ({ empName, weekRange }: DownloadPDFOptions) => {
  const element = document.getElementById('analysis');

  if (!element) {
    console.error('Analysis element not found');
    return;
  }

  try {
    // Show loading toast
    const loadingToast = toast.loading('Generating PDF...');

    // Capture the element as canvas with higher quality
    const canvas = await html2canvas(element, {
      scale: 2, // Higher quality
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    // Calculate PDF dimensions
    const imgWidth = 190; // A4 width in mm minus margins
    const pageHeight = 277; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    let heightLeft = imgHeight;
    let position = 10; // Top margin

    // Add title
    pdf.setFontSize(16);
    pdf.setTextColor(147, 51, 234); // Purple color
    pdf.text('AI-Powered Weekly Emotional Analysis', 10, position);
    position += 8;

    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Employee: ${empName}`, 10, position);
    position += 6;

    if (weekRange) {
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Period: ${weekRange}`, 10, position);
      position += 10;
    } else {
      position += 4;
    }

    // Add the canvas image
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add new pages if content is longer than one page
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight + 10;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Save the PDF
    const fileName = `${empName.replace(/\s+/g, '_')}_Analysis_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);

    // Dismiss loading and show success
    toast.dismiss(loadingToast);
    toast.success('PDF downloaded successfully!');
  } catch (error) {
    console.error('Error generating PDF:', error);
    toast.error('Failed to generate PDF');
  }
};

export const getInitialName = (fullName: string) => {
  return `${fullName?.split(" ")[0]?.charAt(0).toUpperCase()}${fullName?.split(" ")[1]?.charAt(0).toUpperCase()}`
}

export const MONTHS = Array.from({ length: 12 }, (_, i) => {
  const year = new Date().getFullYear();
  const month = i + 1; //* 1–12
  const name = new Date(year, i).toLocaleString("en-US", { month: "long" });
  const value = `${year}-${String(month).padStart(2, "0")}-01`;

  return { name, value };
});

const currentYear = new Date().getFullYear();
export const YEARS = Array.from({ length: 6 }, (_, i) => {
  const year = currentYear - 5 + i

  return {
    name: `${year}`,
    value: `${year}-01-01`,
  }
})

export function formatId(id: string) {
  return `..${id.substring(id.length - 8)}`;
}

/**
 * Format phone number to a standard format
 * Examples:
 * - "1234567890" -> "(123) 456-7890"
 * - "959123456789" -> "+959 123 456 789"
 * - "09123456789" -> "09 123 456 789"
 */
export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return "";

  //* Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, "");

  //* Myanmar format (starting with 959 or 09)
  if (cleaned.startsWith("959") && cleaned.length === 12) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
  }

  if (cleaned.startsWith("09") && cleaned.length === 11) {
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
  }

  //* US format (10 digits)
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  //* International format (more than 10 digits)
  if (cleaned.length > 10) {
    return `+${cleaned.slice(0, cleaned.length - 10)} ${cleaned.slice(-10, -7)} ${cleaned.slice(-7, -4)} ${cleaned.slice(-4)}`;
  }

  //* Default: return as-is if format doesn't match
  return phone;
};

export const generateEmployeeId = (id: number, prefix: string = "ATA"): string => {
  if (id < 1 || id > 9999) {
    throw new Error("Employee ID must be between 1 and 9999");
  }

  return `${prefix}-${String(id).padStart(4, "0")}`;
};

export const formatWithLeadingZeros = (num: number, length: number = 4): string => {
  return String(num).padStart(length, "0");
};
