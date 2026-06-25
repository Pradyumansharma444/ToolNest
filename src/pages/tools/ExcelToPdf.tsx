import { useState } from 'react';
import * as XLSX from 'xlsx';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { FileSpreadsheet, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/tools/FileUpload';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById, downloadBlob } from '@/data/tools';
import { useToast } from '@/hooks/use-toast';

export default function ExcelToPdf() {
  const tool = getToolById('excel-to-pdf')!;
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [resultReady, setResultReady] = useState(false);

  const handleFileSelected = (files: File[]) => {
    if (files.length > 0) { setFile(files[0]); setResultReady(false); }
  };

  const convert = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 });

      if (data.length === 0) {
        toast({ title: 'Empty spreadsheet', description: 'No data found in the Excel file.', variant: 'destructive' });
        setProcessing(false);
        return;
      }

      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const pageWidth = 842;
      const pageHeight = 595;
      const margin = 40;
      const colWidth = (pageWidth - margin * 2) / Math.min(data[0]?.length || 1, 10);
      const rowHeight = 18;
      const fontSize = 9;

      let page = pdfDoc.addPage([pageWidth, pageHeight]);
      let y = pageHeight - margin;

      const drawHeader = (rowData: string[], yPos: number) => {
        rowData.forEach((cell, colIdx) => {
          if (colIdx > 9) return;
          const x = margin + colIdx * colWidth;
          const text = String(cell || '').slice(0, 30);
          const textWidth = fontBold.widthOfTextAtSize(text, fontSize);
          const cellWidth = colWidth - 4;
          const drawWidth = Math.min(textWidth, cellWidth);
          const clippedText = drawWidth < textWidth ? text.slice(0, Math.floor(text.length * drawWidth / textWidth)) : text;
          page.drawText(clippedText, { x, y: yPos - fontSize, size: fontSize, font: fontBold, color: rgb(0, 0, 0) });
        });
      };

      const drawRow = (rowData: string[], yPos: number) => {
        rowData.forEach((cell, colIdx) => {
          if (colIdx > 9) return;
          const x = margin + colIdx * colWidth;
          const text = String(cell || '').slice(0, 30);
          const textWidth = font.widthOfTextAtSize(text, fontSize);
          const cellWidth = colWidth - 4;
          const drawWidth = Math.min(textWidth, cellWidth);
          const clippedText = drawWidth < textWidth ? text.slice(0, Math.floor(text.length * drawWidth / textWidth)) : text;
          page.drawText(clippedText, { x, y: yPos - fontSize, size: fontSize, font, color: rgb(0, 0, 0) });
        });
      };

      data.forEach((row, rowIdx) => {
        if (y - rowHeight < margin) {
          page = pdfDoc.addPage([pageWidth, pageHeight]);
          y = pageHeight - margin;
        }

        if (rowIdx === 0) {
          drawHeader(row as string[], y);
          y -= 2;
          page.drawLine({ start: { x: margin, y }, end: { x: pageWidth - margin, y }, thickness: 0.5, color: rgb(0.5, 0.5, 0.5) });
          y -= rowHeight - 4;
        } else {
          drawRow(row as string[], y);
          y -= rowHeight;
        }
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      setResultReady(true);
      downloadBlob(blob, file.name.replace(/\.(xlsx|xls|csv)$/i, '.pdf'));
      toast({ title: 'Excel converted to PDF!', description: `Converted ${data.length} rows to PDF.` });
    } catch {
      toast({ title: 'Conversion failed', description: 'Could not convert this Excel file.', variant: 'destructive' });
    } finally { setProcessing(false); }
  };

  return (
    <ToolLayout tool={tool} resultVisible={resultReady}>
      <div className="space-y-6">
        <FileUpload accept={{ 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'], 'application/vnd.ms-excel': ['.xls'], 'text/csv': ['.csv'] }} onFilesSelected={handleFileSelected} selectedFile={file} onFileRemoved={() => { setFile(null); setResultReady(false); }} label="Upload Excel/CSV File" />
        {file && (
          <Button onClick={convert} disabled={processing} size="lg" className="w-full">
            {processing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Converting...</> : <><FileSpreadsheet className="w-4 h-4 mr-2" /> Convert to PDF</>}
          </Button>
        )}
        {resultReady && (
          <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-4 text-center">
            <p className="text-emerald-700 dark:text-emerald-300 font-medium">Excel converted to PDF successfully!</p>
            <Button onClick={convert} className="mt-3"><Download className="w-4 h-4 mr-2" /> Download Again</Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
