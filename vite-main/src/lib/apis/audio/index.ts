export const transcribeAudio = async (token: string, file: File, language?: string) => {
	console.warn('Audio transcription is not available');
	return { text: '' };
};

export const synthesizeOpenAISpeech = async (
	token: string = '',
	speaker: string = 'alloy',
	text: string = '',
	model?: string
) => {
	console.warn('Speech synthesis is not available');
	return null;
};

export const getVoices = async (token: string = '') => {
	return { voices: [] };
};
