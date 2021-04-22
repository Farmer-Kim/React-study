// 파형 관련 로직
// getContext = () => {
// 	window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.oAudioContext;
// 	const context = new AudioContext();
// 	  return context;
// }
// getAudioBuffer = async(audio, context) => {
// 	// fetch api는 사라질 예정
// 	// const audioBuffer = audio.arrayBuffer(); or const audioBuffer = audio;
// 	const res = await fetch(audio);
// 	const audioBuffer = await res.arrayBuffer();
	
// 	return new Promise((resolve, reject) => {
// 			context.decodeAudioData(audioBuffer, buffer => {
// 			return resolve(buffer);
// 		});
// 	});
// }
// setWaveForm = async(audio) => {
// 	const buffer = await this.getAudioBuffer(audio, this.getContext());
// 	this.setState({buffer : buffer});
// }