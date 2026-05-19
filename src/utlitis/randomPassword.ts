//Tao 1 password random. Sau do gui ve mail cua nguoi dung
export function generateRandomPassword(length: number = 8): string {
	const chars =
		'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let password = '';

	for (let i = 0; i < length; i++) {
		const index = Math.floor(Math.random() * chars.length);
		password += chars[index];
	}

	return password;
}
