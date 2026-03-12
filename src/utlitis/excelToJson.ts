//Source Code + GPT (Adding types): https://freedium-mirror.cfd/https://medium.com/@shafiulmizbah2/converting-downloadable-excel-file-to-json-in-js-react-js-next-js-7a971e461455
import * as XLSX from "xlsx";

type ExcelRow = Record<string, unknown>;

const convertExcelToJson = async (buffer: Buffer): Promise<ExcelRow[]> => {
  try {

    const workbook: XLSX.WorkBook = XLSX.read(buffer, { type: "buffer" });

    const sheetName: string = workbook.SheetNames[0];
    const sheet: XLSX.WorkSheet = workbook.Sheets[sheetName];

    const jsonData: unknown[][] = XLSX.utils.sheet_to_json(sheet, {
      header: 1
    });

    const headers = jsonData[0] as string[];

    const resultArray: ExcelRow[] = jsonData.map((row: unknown[]) => {
      const obj: ExcelRow = {};

      for (let i = 0; i < headers.length; i++) {
        obj[headers[i]] = row[i];
      }

      return obj;
    });

    return resultArray.slice(1);

  } catch (error) {
    console.error("Error converting Excel to JSON:", error);
    throw error;
  }
};

export default convertExcelToJson;