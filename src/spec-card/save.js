/**
 * Saved markup for the Spec Card block.
 *
 * A static block, so the markup is serialised into post content. That means it
 * keeps rendering if the plugin is ever deactivated, which is the right
 * trade-off for presentational content an editor has written by hand.
 */

import { useBlockProps, useInnerBlocksProps, RichText } from '@wordpress/block-editor';

export default function Save( { attributes } ) {
	const { heading, eyebrow, showEyebrow, headingLevel } = attributes;

	const blockProps = useBlockProps.save( {
		className: 'directory-blocks-spec-card',
	} );

	const innerBlocksProps = useInnerBlocksProps.save( {
		className: 'directory-blocks-spec-card__body',
	} );

	const HeadingTag = `h${ headingLevel }`;

	return (
		<div { ...blockProps }>
			{ showEyebrow && eyebrow !== '' && (
				<RichText.Content
					tagName="p"
					className="directory-blocks-spec-card__eyebrow"
					value={ eyebrow }
				/>
			) }

			{ heading !== '' && (
				<RichText.Content
					tagName={ HeadingTag }
					className="directory-blocks-spec-card__heading"
					value={ heading }
				/>
			) }

			<div { ...innerBlocksProps } />
		</div>
	);
}
