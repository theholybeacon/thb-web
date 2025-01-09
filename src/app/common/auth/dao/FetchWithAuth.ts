import { auth } from "../../../../../firebase.config";

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
	const user = auth.currentUser;
	if (user) {
		const token = await user.getIdToken();
		let headers = {
			...options.headers,
			Authorization: `Bearer ${token}`,
			uuid: user.uid
		};
		return fetch(url, { ...options, headers });
	} else {
		throw new Error('User not authenticated');
	}
};
