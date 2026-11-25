/**
 * Registers the Directory block and a preset variation.
 */

import { registerBlockType, registerBlockVariation } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';

import metadata from './block.json';
import Edit from './edit';
import './style.scss';

registerBlockType( metadata.name, {
	edit: Edit,
	// Dynamic block: markup is produced by render.php, so there is no save().
	save: () => null,
} );

/**
 * A variation rather than a second block, because the markup and controls are
 * identical and only the defaults differ. Two blocks would mean two code paths
 * to keep in step.
 */
registerBlockVariation( metadata.name, {
	name: 'directory-blocks/directory-compact',
	title: __( 'Directory (compact rows)', 'directory-blocks' ),
	description: __(
		'A single-column directory with no images, for dense listings.',
		'directory-blocks'
	),
	icon: 'list-view',
	attributes: {
		columns: 1,
		showImage: false,
		showExcerpt: false,
		className: 'is-style-rows',
	},
	scope: [ 'inserter' ],
} );
