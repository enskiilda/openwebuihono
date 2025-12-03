export const transcribeAudio = async (token: string, file: File, language?: string) => {
	return { text: '' };
};

export const synthesizeOpenAISpeech = async (
	token: string = '',
	speaker: string = 'alloy',
	text: string = '',
	model?: string
) => {
	return null;
};

export const getVoices = async (token: string = '') => {
	return { voices: [] };
};
