/**
 * Editor interface for the Spec Card block.
 *
 * The heading is a bound RichText and the body is InnerBlocks, which is the
 * split that matters: an editor can put anything in the body (a list, an image,
 * a button) without being able to break the card's structure.
 */

import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	useInnerBlocksProps,
	RichText,
	InspectorControls,
	HeadingLevelDropdown,
	BlockControls,
} from '@wordpress/block-editor';
import { PanelBody, ToggleControl } from '@wordpress/components';

import './style.scss';

/**
 * A starting point, not a cage: the template seeds one paragraph, and
 * templateLock is left off so editors can add and reorder freely.
 */
const TEMPLATE = [
	[
		'core/paragraph',
		{ placeholder: __( 'Add details…', 'directory-blocks' ) },
	],
];

const ALLOWED_BLOCKS = [
	'core/paragraph',
	'core/list',
	'core/image',
	'core/buttons',
	'core/separator',
	'core/table',
];

export default function Edit( { attributes, setAttributes } ) {
	const { heading, eyebrow, showEyebrow, headingLevel } = attributes;

	const blockProps = useBlockProps( {
		className: 'directory-blocks-spec-card',
	} );

	const innerBlocksProps = useInnerBlocksProps(
		{ className: 'directory-blocks-spec-card__body' },
		{
			template: TEMPLATE,
			allowedBlocks: ALLOWED_BLOCKS,
		}
	);

	const HeadingTag = `h${ headingLevel }`;

	return (
		<>
			<BlockControls group="block">
				<HeadingLevelDropdown
					value={ headingLevel }
					options={ [ 2, 3, 4, 5 ] }
					onChange={ ( value ) =>
						setAttributes( { headingLevel: value } )
					}
				/>
			</BlockControls>

			<InspectorControls>
				<PanelBody title={ __( 'Card', 'directory-blocks' ) }>
					<ToggleControl
						label={ __( 'Show eyebrow', 'directory-blocks' ) }
						help={ __(
							'A short label above the heading, such as a category.',
							'directory-blocks'
						) }
						checked={ showEyebrow }
						onChange={ ( value ) =>
							setAttributes( { showEyebrow: value } )
						}
						__nextHasNoMarginBottom
					/>
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				{ showEyebrow && (
					<RichText
						tagName="p"
						className="directory-blocks-spec-card__eyebrow"
						value={ eyebrow }
						onChange={ ( value ) =>
							setAttributes( { eyebrow: value } )
						}
						placeholder={ __( 'Eyebrow', 'directory-blocks' ) }
						allowedFormats={ [] }
					/>
				) }

				<RichText
					tagName={ HeadingTag }
					className="directory-blocks-spec-card__heading"
					value={ heading }
					onChange={ ( value ) =>
						setAttributes( { heading: value } )
					}
					placeholder={ __( 'Card heading', 'directory-blocks' ) }
					allowedFormats={ [ 'core/bold', 'core/italic' ] }
				/>

				<div { ...innerBlocksProps } />
			</div>
		</>
	);
}
