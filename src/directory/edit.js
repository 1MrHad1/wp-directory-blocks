/**
 * Editor interface for the Directory block.
 *
 * The preview queries real entries through core-data rather than rendering a
 * placeholder, so what an editor sees while configuring the block is the
 * content that will actually ship. Taxonomy and post type choices are read from
 * the site rather than hardcoded, so the block works on any install.
 */

import { __, sprintf } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import {
	PanelBody,
	SelectControl,
	RangeControl,
	ToggleControl,
	Spinner,
	Notice,
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';

import './editor.scss';

const MAX_PREVIEW_ENTRIES = 6;

export default function Edit( { attributes, setAttributes } ) {
	const {
		postType,
		taxonomy,
		perPage,
		columns,
		orderBy,
		showFilters,
		showExcerpt,
		showImage,
	} = attributes;

	// Post types and taxonomies come from the site, so a custom post type
	// registered by a theme or another plugin shows up without a code change.
	const { postTypes, taxonomies } = useSelect( ( select ) => {
		const { getPostTypes, getTaxonomies } = select( coreStore );

		return {
			postTypes: getPostTypes( { per_page: -1 } ),
			taxonomies: getTaxonomies( { per_page: -1 } ),
		};
	}, [] );

	const { entries, isResolving } = useSelect(
		( select ) => {
			const { getEntityRecords, isResolving: isResolvingSelector } =
				select( coreStore );

			const query = {
				per_page: Math.min( perPage, MAX_PREVIEW_ENTRIES ),
				orderby: orderBy === 'title' ? 'title' : 'date',
				order: orderBy === 'title' ? 'asc' : 'desc',
				status: 'publish',
				_embed: true,
			};

			const args = [ 'postType', postType, query ];

			return {
				entries: getEntityRecords( ...args ),
				isResolving: isResolvingSelector( 'getEntityRecords', args ),
			};
		},
		[ postType, perPage, orderBy ]
	);

	const publicPostTypes = ( postTypes ?? [] ).filter(
		( type ) => type.viewable && type.slug !== 'attachment'
	);

	const relevantTaxonomies = ( taxonomies ?? [] ).filter( ( tax ) =>
		( tax.types ?? [] ).includes( postType )
	);

	const blockProps = useBlockProps( {
		className: `directory-blocks-directory has-${ columns }-columns`,
	} );

	// Filtering can fail in two different ways, and an earlier version of this
	// only caught the second one. A post type with no public taxonomies at all
	// (pages, by default) short-circuited the check and warned about nothing.
	const hasNoTaxonomies = relevantTaxonomies.length === 0;
	const taxonomyMismatch =
		! hasNoTaxonomies &&
		! relevantTaxonomies.some( ( tax ) => tax.slug === taxonomy );
	const filterWarning =
		showFilters && ( hasNoTaxonomies || taxonomyMismatch );

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Source', 'directory-blocks' ) }>
					<SelectControl
						label={ __( 'Post type', 'directory-blocks' ) }
						value={ postType }
						options={ publicPostTypes.map( ( type ) => ( {
							label: type.name,
							value: type.slug,
						} ) ) }
						onChange={ ( value ) =>
							setAttributes( { postType: value } )
						}
						__nextHasNoMarginBottom
					/>
					<SelectControl
						label={ __( 'Filter by', 'directory-blocks' ) }
						value={ taxonomy }
						options={ relevantTaxonomies.map( ( tax ) => ( {
							label: tax.name,
							value: tax.slug,
						} ) ) }
						onChange={ ( value ) =>
							setAttributes( { taxonomy: value } )
						}
						help={ __(
							'Only taxonomies registered for the chosen post type are listed.',
							'directory-blocks'
						) }
						__nextHasNoMarginBottom
					/>
					<SelectControl
						label={ __( 'Order by', 'directory-blocks' ) }
						value={ orderBy }
						options={ [
							{
								label: __( 'Title (A-Z)', 'directory-blocks' ),
								value: 'title',
							},
							{
								label: __(
									'Date (newest first)',
									'directory-blocks'
								),
								value: 'date',
							},
						] }
						onChange={ ( value ) =>
							setAttributes( { orderBy: value } )
						}
						__nextHasNoMarginBottom
					/>
					<RangeControl
						label={ __( 'Entries', 'directory-blocks' ) }
						value={ perPage }
						onChange={ ( value ) =>
							setAttributes( { perPage: value } )
						}
						min={ 1 }
						max={ 48 }
						__nextHasNoMarginBottom
					/>
				</PanelBody>

				<PanelBody title={ __( 'Layout', 'directory-blocks' ) }>
					<RangeControl
						label={ __( 'Columns', 'directory-blocks' ) }
						value={ columns }
						onChange={ ( value ) =>
							setAttributes( { columns: value } )
						}
						min={ 1 }
						max={ 4 }
						__nextHasNoMarginBottom
					/>
					<ToggleControl
						label={ __( 'Show filter bar', 'directory-blocks' ) }
						checked={ showFilters }
						onChange={ ( value ) =>
							setAttributes( { showFilters: value } )
						}
						__nextHasNoMarginBottom
					/>
					<ToggleControl
						label={ __(
							'Show featured image',
							'directory-blocks'
						) }
						checked={ showImage }
						onChange={ ( value ) =>
							setAttributes( { showImage: value } )
						}
						__nextHasNoMarginBottom
					/>
					<ToggleControl
						label={ __( 'Show excerpt', 'directory-blocks' ) }
						checked={ showExcerpt }
						onChange={ ( value ) =>
							setAttributes( { showExcerpt: value } )
						}
						__nextHasNoMarginBottom
					/>
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				{ filterWarning && (
					<Notice status="warning" isDismissible={ false }>
						{ hasNoTaxonomies
							? __(
									'This post type has no taxonomies registered, so no filters can be shown. Turn off the filter bar, or pick a post type that has categories or tags.',
									'directory-blocks'
								)
							: sprintf(
									/* translators: %s: taxonomy slug. */
									__(
										'"%s" is not registered for this post type, so no filters can be shown.',
										'directory-blocks'
									),
									taxonomy
								) }
					</Notice>
				) }

				{ isResolving && (
					<p className="directory-blocks-directory__loading">
						<Spinner />
						{ __( 'Loading entries…', 'directory-blocks' ) }
					</p>
				) }

				{ ! isResolving && entries?.length === 0 && (
					<Notice status="info" isDismissible={ false }>
						{ __(
							'No published entries found for this post type yet.',
							'directory-blocks'
						) }
					</Notice>
				) }

				{ ! isResolving && entries?.length > 0 && (
					<>
						{ showFilters && (
							<div className="directory-blocks-directory__filters">
								<span className="directory-blocks-directory__filter is-active">
									{ __( 'All', 'directory-blocks' ) }
								</span>
								<span className="directory-blocks-directory__filter">
									{ __(
										'Filters render on the front end',
										'directory-blocks'
									) }
								</span>
							</div>
						) }

						<ul className="directory-blocks-directory__grid">
							{ entries.map( ( entry ) => {
								const image =
									entry._embedded?.[
										'wp:featuredmedia'
									]?.[ 0 ]?.source_url;

								return (
									<li
										key={ entry.id }
										className="directory-blocks-directory__entry"
									>
										{ showImage && image && (
											<img
												className="directory-blocks-directory__image"
												src={ image }
												alt=""
											/>
										) }
										<h3 className="directory-blocks-directory__title">
											{ entry.title?.rendered ||
												__(
													'(no title)',
													'directory-blocks'
												) }
										</h3>
										{ showExcerpt && (
											<p
												className="directory-blocks-directory__excerpt"
												// Excerpts come back as rendered HTML from the REST API.
												dangerouslySetInnerHTML={ {
													__html:
														entry.excerpt
															?.rendered ?? '',
												} }
											/>
										) }
									</li>
								);
							} ) }
						</ul>

						{ perPage > MAX_PREVIEW_ENTRIES && (
							<p className="directory-blocks-directory__note">
								{ sprintf(
									/* translators: 1: preview count, 2: configured count. */
									__(
										'Previewing %1$d of %2$d entries. All of them render on the front end.',
										'directory-blocks'
									),
									MAX_PREVIEW_ENTRIES,
									perPage
								) }
							</p>
						) }
					</>
				) }
			</div>
		</>
	);
}
