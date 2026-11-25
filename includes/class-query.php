<?php
/**
 * Query layer for the directory block.
 *
 * @package DirectoryBlocks
 */

namespace DirectoryBlocks;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Fetches and shapes the entries a directory block renders.
 *
 * Kept separate from the render template so the data shape can be tested and
 * reused (for example by a REST field) without going through block rendering.
 */
class Query {

	/**
	 * Cache group for query results.
	 */
	private const CACHE_GROUP = 'directory_blocks';

	/**
	 * Fetch directory entries.
	 *
	 * @param array $args {
	 *     @type string $post_type Post type to query.
	 *     @type string $taxonomy  Taxonomy to group and filter by.
	 *     @type int    $per_page  Maximum entries to return.
	 *     @type string $order_by  Either 'title' or 'date'.
	 * }
	 * @return array[] List of entries, each with id, title, url, excerpt, image and terms.
	 */
	public static function get_entries( array $args ): array {
		$args = wp_parse_args(
			$args,
			array(
				'post_type' => 'post',
				'taxonomy'  => 'category',
				'per_page'  => 12,
				'order_by'  => 'title',
			)
		);

		$post_type = sanitize_key( $args['post_type'] );
		$taxonomy  = sanitize_key( $args['taxonomy'] );
		$per_page  = max( 1, min( 100, (int) $args['per_page'] ) );
		$order_by  = in_array( $args['order_by'], array( 'title', 'date' ), true ) ? $args['order_by'] : 'title';

		// Bail early rather than letting WP_Query fall back to posts, which would
		// silently render the wrong content when a post type is deactivated.
		if ( ! post_type_exists( $post_type ) ) {
			return array();
		}

		$cache_key = 'entries_' . md5( wp_json_encode( compact( 'post_type', 'taxonomy', 'per_page', 'order_by' ) ) );
		$cached    = wp_cache_get( $cache_key, self::CACHE_GROUP );

		if ( false !== $cached ) {
			return $cached;
		}

		$query = new \WP_Query(
			array(
				'post_type'              => $post_type,
				'post_status'            => 'publish',
				'posts_per_page'         => $per_page,
				'orderby'                => 'title' === $order_by ? 'title' : 'date',
				'order'                  => 'title' === $order_by ? 'ASC' : 'DESC',
				'ignore_sticky_posts'    => true,
				// This block never paginates, so skip the COUNT(*) that
				// WP_Query would otherwise run for pagination it will not use.
				'no_found_rows'          => true,
				'update_post_meta_cache' => false,
			)
		);

		$entries = array();

		foreach ( $query->posts as $post ) {
			$terms = taxonomy_exists( $taxonomy ) ? get_the_terms( $post, $taxonomy ) : array();

			$entries[] = array(
				'id'      => $post->ID,
				'title'   => get_the_title( $post ),
				'url'     => get_permalink( $post ),
				'excerpt' => wp_trim_words( get_the_excerpt( $post ), 22 ),
				'image'   => get_the_post_thumbnail_url( $post, 'medium' ) ?: '',
				'terms'   => is_array( $terms ) ? wp_list_pluck( $terms, 'slug' ) : array(),
				'labels'  => is_array( $terms ) ? wp_list_pluck( $terms, 'name' ) : array(),
			);
		}

		wp_cache_set( $cache_key, $entries, self::CACHE_GROUP, 5 * MINUTE_IN_SECONDS );

		return $entries;
	}

	/**
	 * Build the filter list from the terms actually present on the entries.
	 *
	 * Listing every term in the taxonomy would show filters that match nothing,
	 * which reads as a broken page. This only returns terms with at least one entry.
	 *
	 * @param array[] $entries Entries from get_entries().
	 * @return array[] List of filters, each with slug and label.
	 */
	public static function get_filters( array $entries ): array {
		$seen = array();

		foreach ( $entries as $entry ) {
			foreach ( $entry['terms'] as $index => $slug ) {
				if ( ! isset( $seen[ $slug ] ) ) {
					$seen[ $slug ] = $entry['labels'][ $index ] ?? $slug;
				}
			}
		}

		asort( $seen );

		$filters = array();
		foreach ( $seen as $slug => $label ) {
			$filters[] = array(
				'slug'  => $slug,
				'label' => $label,
			);
		}

		return $filters;
	}
}
