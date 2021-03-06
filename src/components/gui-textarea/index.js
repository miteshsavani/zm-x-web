import { h, Component } from 'preact';
import Attachment from '../attachment';
import Toolbar from '../gui-rich-text-area/components/toolbar';
import { AffixBottom } from '@zimbra/blocks';
import { TEXT_MODE } from '../../constants/composer';
import cx from 'classnames';
import style from './style';
import get from 'lodash/get';
import linkref from 'linkref';

export default class GuiTextarea extends Component {
	getBase = () => this.base;
	getDocument = () => ({ body: get(this.refs, 'textarea.base') });

	render({
		isSendInProgress,
		onSend,
		onDelete,
		onToggleTextMode,
		attachments,
		onChooseAttachment,
		onRemoveAttachment,
		...props
	}) {
		return (
			<div class={style.fullHeight}>
				<div class={cx(style.relative, style.fullHeight)}>
					<Textarea {...props} ref={linkref(this, 'textarea')} />
				</div>
				<AffixBottom offsetTop={150} container={this.getBase}>
					<div>
						{attachments &&
							attachments.map(attachment => (
								<Attachment
									attachmentGroup={attachments}
									attachment={attachment}
									removable
									downloadable={false}
									previewOnClick
									onRemove={onRemoveAttachment}
								/>
							))}
						<Toolbar
							mode={TEXT_MODE}
							onChooseAttachment={onChooseAttachment}
							isSendInProgress={isSendInProgress}
							onSend={onSend}
							onDelete={onDelete}
							onToggleTextMode={onToggleTextMode}
						/>
					</div>
				</AffixBottom>
			</div>
		);
	}
}

// Normalizes placeholders and resizing
class Textarea extends Component {
	state = { focused: false }

	handleFocusIn = (e) => {
		this.setState({ focused: true });
		if (this.props.onFocusIn) {
			this.props.onFocusIn(e);
		}
	}
	handleBlur = (e) => {
		this.setState({ focused: false });
		if (this.props.onBlur) {
			this.props.onBlur(e);
		}
	}
	render({ value, placeholder, ...props }, { focused }) {
		return (
			<textarea
				{...props}
				onFocusIn={this.handleFocusIn}
				onBlur={this.handleBlur}
				class={cx(!value && style.placeholder, props.class)}
				value={value || (!focused && placeholder) || ''}
			/>
		);
	}
}
