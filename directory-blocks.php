<?php
/**
 * Plugin Name:       Directory Blocks
 * Description:       A server-rendered, filterable post directory built on the Interactivity API, plus a composable spec card using InnerBlocks.
 * Requires at least: 6.5
 * Requires PHP:      7.4
 * Version:           1.0.0
 * Author:            Haseeb Ahmed Danish
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       directory-blocks
 *
 * @package DirectoryBlocks
 */

namespace DirectoryBlocks;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'DIRECTORY_BLOCKS_VERSION', '1.0.0' );
define( 'DIRECTORY_BLOCKS_PATH', plugin_dir_path( __FILE__ ) );

require_once DIRECTORY_BLOCKS_PATH . 'includes/class-query.php';

/**
 * Register both blocks from their block.json metadata.
 *
 * Registering from metadata is what lets WordPress load each block's stylesheet
 * only on pages where the block is actually present, rather than site-wide.
 * On a content site that is the difference between one render-blocking
 * stylesheet on every page and none on most of them.
 */
function register_blocks(): void {
	foreach ( array( 'directory', 'spec-card' ) as $block ) {
		register_block_type( DIRECTORY_BLOCKS_PATH . 'build/' . $block );
	}
}
add_action( 'init', __NAMESPACE__ . '\register_blocks' );

/**
 * Load translations.
 */
function load_textdomain(): void {
	load_plugin_textdomain( 'directory-blocks', false, dirname( plugin_basename( __FILE__ ) ) . '/languages' );
}
add_action( 'init', __NAMESPACE__ . '\load_textdomain' );

/**
 * Register a block category so both blocks sit together in the inserter.
 *
 * @param array $categories Existing block categories.
 * @return array
 */
function register_category( array $categories ): array {
	return array_merge(
		array(
			array(
				'slug'  => 'directory-blocks',
				'title' => __( 'Directory Blocks', 'directory-blocks' ),
			),
		),
		$categories
	);
}
add_filter( 'block_categories_all', __NAMESPACE__ . '\register_category' );
