import { Registro } from '@/src/interfaces/interfaces';
import { gapi } from 'gapi-script';
/// <reference types="gapi" />


export const readFileContent = async (fileId: string) => {
	try {
		const response = await gapi.client.drive.files.get({
			fileId,
			alt: 'media',
		});

		const isFileEmpty = !response?.body || response?.body?.length === 0;
		if (isFileEmpty) return []		
		return JSON.parse(response.body);
	} catch (error) {
		console.error('Error reading file content:', error);
		throw error;
	}
};

export const add = async (fileId: string, newRegistros: Registro[]) => {
    const registros = await readFileContent(fileId);
    newRegistros.forEach(reg => registros.push(reg));
    return updateFileContent(fileId, registros);
}

export const update = async (fileId: string, newRegistros: Registro[]) => {
    const registros = await readFileContent(fileId);
    let reg = registros.filter((regi: { id: any; }) => newRegistros.map(regBody => regBody.id).indexOf(regi.id) === -1);
    newRegistros.forEach(x => reg.push(x));
    return updateFileContent(fileId, reg);
}

export const remove = async (fileId: string, id: string) => {
	const registros = await readFileContent(fileId) as Registro[];
    return updateFileContent(fileId, registros.filter(regi => regi.id != id));
}

const updateFileContent = async (fileId: string, newRegistros: Registro[]) => {
	try {
		const response = await gapi.client.request({
			path: `/upload/drive/v3/files/${fileId}`,
			method: 'PATCH',
			params: {
				uploadType: 'media',
			},
			headers: {
				'Content-Type': 'application/json',
			},
			body: newRegistros,
		});
		return response;
	} catch (error) {
		console.error('Error updating file content:', error);
		throw error;
	}
};

export const createFile = async (name: string, content: string) => {
	try {
		const boundary = '-------314159265358979323846';
		const delimiter = `\r\n--${boundary}\r\n`;
		const closeDelimiter = `\r\n--${boundary}--`;

		const metadata = {
			name,
			mimeType: 'application/json',
		};

		const multipartRequestBody =
			delimiter +
			'Content-Type: application/json\r\n\r\n' +
			JSON.stringify(metadata) +
			delimiter +
			'Content-Type: application/json\r\n\r\n' +
			content +
			closeDelimiter;

		const response = await gapi.client.request({
			path: '/upload/drive/v3/files',
			method: 'POST',
			params: {
				uploadType: 'multipart',
			},
			headers: {
				'Content-Type': `multipart/related; boundary="${boundary}"`,
			},
			body: multipartRequestBody,
		});

		return response;
	} catch (error) {
		console.error('Error creating file:', error);
		throw error;
	}
};

export const listFiles = async (): Promise<gapi.client.drive.File[]> => {
	try {
		const response = await gapi.client.drive.files.list({
			pageSize: 100,
			fields: 'files(id, name, mimeType)',
		});

		const files = response.result.files;
		return files || [];
	} catch (error) {
		console.error('Error fetching files:', error);
		throw error;
	}
};