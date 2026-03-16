//Source Code + GPT (Adding types): https://freedium-mirror.cfd/https://medium.com/@shafiulmizbah2/converting-downloadable-excel-file-to-json-in-js-react-js-next-js-7a971e461455
import * as XLSX from 'xlsx';

type ExcelRow = Record<string, any>;

const convertExcelToJson = async (buffer: Buffer): Promise<ExcelRow[]> => {
	try {
		const workbook = XLSX.read(buffer, { type: 'buffer' });
		const sheet = workbook.Sheets[workbook.SheetNames[0]];

		const data = XLSX.utils.sheet_to_json(sheet, {
			range: 4,
		});

		return data as ExcelRow[];
	} catch (error) {
		console.error('Error converting Excel to JSON:', error);
		throw error;
	}
};

export default convertExcelToJson;
