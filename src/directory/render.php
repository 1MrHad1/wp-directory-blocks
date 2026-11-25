<?php
/**
 * Front-end render for the Directory block.
 *
 * @package DirectoryBlocks
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Inner content.
 * @var WP_Block $block      Block instance.
 */

namespace DirectoryBlocks;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$entries = Query::get_entries(
	array(
		'post_type' => $attributes['postType'] ?? 'post',
		'taxonomy'  => $attributes['taxonomy'] ?? 'category',
		'per_page'  => $attributes['perPage'] ?? 12,
		'order_by'  => $attributes['orderBy'] ?? 'title',
	)
);

// Render nothing at all rather than an empty shell with padding and a filter
// bar, which looks like a broken section to a visitor.
if ( empty( $entries ) ) {
	return '';
}

$show_filters = ! empty( $attributes['showFilters'] );
$show_excerpt = ! empty( $attributes['showExcerpt'] );
$show_image   = ! empty( $attributes['showImage'] );
$columns      = max( 1, min( 4, (int) ( $attributes['columns'] ?? 3 ) ) );

$filters = $show_filters ? Query::get_filters( $entries ) : array();

$wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class' => 'directory-blocks-directory has-' . $columns . '-columns',
	)
);
?>
<div
	<?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by core. ?>
	data-wp-interactive="directory-blocks"
	<?php echo wp_interactivity_data_wp_context( array( 'activeTerm' => '' ) ); ?>
>
	<?php if ( ! empty( $filters ) ) : ?>
		<div class="directory-blocks-directory__filters" role="group" aria-label="<?php esc_attr_e( 'Filter entries', 'directory-blocks' ); ?>">
			<button
				type="button"
				class="directory-blocks-directory__filter"
				data-wp-on--click="actions.clearFilter"
				data-wp-bind--aria-pressed="state.isAllActive"
				aria-pressed="true"
			>
				<?php esc_html_e( 'All', 'directory-blocks' ); ?>
			</button>

			<?php foreach ( $filters as $filter ) : ?>
				<button
					type="button"
					class="directory-blocks-directory__filter"
					data-wp-on--click="actions.setFilter"
					data-wp-bind--aria-pressed="state.isFilterActive"
					<?php echo wp_interactivity_data_wp_context( array( 'term' => $filter['slug'] ) ); ?>
					aria-pressed="false"
				>
					<?php echo esc_html( $filter['label'] ); ?>
				</button>
			<?php endforeach; ?>
		</div>
	<?php endif; ?>

	<ul class="directory-blocks-directory__grid">
		<?php foreach ( $entries as $entry ) : ?>
			<li
				class="directory-blocks-directory__entry"
				<?php echo wp_interactivity_data_wp_context( array( 'terms' => $entry['terms'] ) ); ?>
				data-wp-bind--hidden="state.isHidden"
			>
				<?php if ( $show_image && $entry['image'] ) : ?>
					<a class="directory-blocks-directory__image-link" href="<?php echo esc_url( $entry['url'] ); ?>" tabindex="-1" aria-hidden="true">
						<img
							class="directory-blocks-directory__image"
							src="<?php echo esc_url( $entry['image'] ); ?>"
							alt=""
							loading="lazy"
							decoding="async"
						/>
					</a>
				<?php endif; ?>

				<h3 class="directory-blocks-directory__title">
					<a href="<?php echo esc_url( $entry['url'] ); ?>">
						<?php echo esc_html( $entry['title'] ); ?>
					</a>
				</h3>

				<?php if ( ! empty( $entry['labels'] ) ) : ?>
					<p class="directory-blocks-directory__terms">
						<?php echo esc_html( implode( ', ', $entry['labels'] ) ); ?>
					</p>
				<?php endif; ?>

				<?php if ( $show_excerpt && $entry['excerpt'] ) : ?>
					<p class="directory-blocks-directory__excerpt">
						<?php echo esc_html( $entry['excerpt'] ); ?>
					</p>
				<?php endif; ?>
			</li>
		<?php endforeach; ?>
	</ul>

</div>
