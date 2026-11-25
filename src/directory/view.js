/**
 * Front-end behaviour for the Directory block.
 *
 * Filtering runs through the Interactivity API, so there is no jQuery and no
 * bespoke event wiring. Every entry is already in the HTML from the server
 * render, which means the list is complete for search engines and for anyone
 * with JavaScript disabled; filtering only ever hides what is already there.
 */

import { store, getContext } from '@wordpress/interactivity';

store( 'directory-blocks', {
	state: {
		/**
		 * Whether an entry is hidden under the current filter.
		 *
		 * Context is merged down the tree, so an entry sees both its own
		 * `terms` and the `activeTerm` set on the block wrapper.
		 */
		get isHidden() {
			const { activeTerm, terms } = getContext();

			if ( ! activeTerm ) {
				return false;
			}

			return ! ( terms ?? [] ).includes( activeTerm );
		},

		/**
		 * Whether a given filter button is the active one.
		 */
		get isFilterActive() {
			const { activeTerm, term } = getContext();
			return activeTerm === term;
		},

		/**
		 * Whether the "All" button is active.
		 */
		get isAllActive() {
			const { activeTerm } = getContext();
			return ! activeTerm;
		},
	},

	actions: {
		/**
		 * Select a term. Clicking the active term clears it, so the same
		 * button toggles rather than stranding the visitor in a filtered view
		 * with no obvious way back.
		 */
		setFilter() {
			const context = getContext();
			context.activeTerm =
				context.activeTerm === context.term ? '' : context.term;
		},

		/**
		 * Clear the filter and show everything.
		 */
		clearFilter() {
			getContext().activeTerm = '';
		},
	},
} );
