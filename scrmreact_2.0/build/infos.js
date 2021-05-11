function getInfos() {
	var infos = {
		prod: {
			host: '172.16.0.30',
			domain: 'itfact.iptime.org',
			port: '8080',
			domainPort: '12388'
		},
		dev: {
			host: '',
			domain: '',
			port: '',
			domainPort: ''
		},
		localbuild: {
			host: '192.168.0.55',
			domain: '',
			port: '8443'
		},
		local: {
			host: 'localhost',
			domain: '',
			port: '8080'
		},
		// demo : {
		// 	host: 'itfact.iptime.org',
		// 	domain: '',
		// 	port: '12388'
			
		// }
	};
	return infos;
}