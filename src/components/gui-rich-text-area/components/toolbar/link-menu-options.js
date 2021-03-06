import { WEB_LINKS } from '../../../../store/media-menu/constants';
import { COMMAND_TYPE } from './index';

export const INSERT_LINK = 'link';
export const INSERT_LINK_OPTIONS = [
	{
		label: 'links.insertLink',
		value: INSERT_LINK
	},{
		label: 'links.searchWebLinks',
		value: WEB_LINKS
	}
];

export function generateInsertLinkMenu (cmd) {
	return cmd('link', null, COMMAND_TYPE.MENU, {
		title: 'titleLink',
		submenu: [
			{
				menuItems: INSERT_LINK_OPTIONS.map(({ label, value }) => cmd(
					null,
					null,
					COMMAND_TYPE.LINK,
					{
						label,
						value
					}
				))
			}
		]
	});
}