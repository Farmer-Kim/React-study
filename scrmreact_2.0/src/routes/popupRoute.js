import PwdInit   from 'containers/base/common/pwdInit.js';
import pwdChg   from 'containers/base/common/pwdChg.js';
import COM010001 from 'containers/com/COM010001';
import COM010010 from 'containers/com/COM010010';
import COM010020 from 'containers/com/COM010020';
import STT000001 from 'containers/stt/STT000001';

import STT010001 from 'containers/stt/STT010001';
import STT050001 from 'containers/stt/STT050001';
import STT050003 from 'containers/stt/STT050003';
import STT060001 from 'containers/stt/STT060001';

import STA030001 from 'containers/sta/STA030001';
import STA030002 from 'containers/sta/STA030002';
import STA030003 from 'containers/sta/STA030003';

import BOT010001 from 'containers/bot/BOT010001';
import BOT010101 from 'containers/bot/BOT010101';


import SYS010001 from 'containers/sys/SYS010001';
import SYS030001 from 'containers/sys/SYS030001';

import AnswerArea from 'components/Player/AnswerArea';

export const popRoute = [
	{ id: 'pwdInit',		component: PwdInit },
	{ id: 'pwdChg',			component: pwdChg },
	{ id: 'AnswerArea',		component: AnswerArea },
	
	
	{ id: 'COM010001',		component: COM010001 },

	{ id: 'COM010010',		component: COM010010 },
	{ id: 'COM010020',		component: COM010020 },
	{ id: 'STT000001',		component: STT000001 },
		
	{ id: 'STT010001',		component: STT010001 },
	{ id: 'STT050001',		component: STT050001 },
	{ id: 'STT050003',		component: STT050003 },
	{ id: 'STT060001',		component: STT060001 },
	
	{ id: 'STA030001',		component: STA030001 },
	{ id: 'STA030002',		component: STA030002 },
	{ id: 'STA030003',		component: STA030003 },
	{ id: 'BOT010001',		component: BOT010001 },
	{ id: 'BOT010101',		component: BOT010101 },
	
	{ id: 'SYS010001',		component: SYS010001 },
	{ id: 'SYS030001',		component: SYS030001 },

];