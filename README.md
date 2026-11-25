# Directory Blocks

Two WordPress blocks built with the block.json metadata API: a **server-rendered, filterable post directory** using the Interactivity API, and a **composable spec card** using InnerBlocks.

Written as a working reference for how I build blocks, so the two deliberately cover opposite halves of the problem: one dynamic block that renders in PHP and owns its own front-end behaviour, and one static block that serialises to post content and gets out of the editor's way.

Requires WordPress 6.5 or later (the Interactivity API) and PHP 7.4 or later.

---

## The blocks

### Directory (dynamic)

Queries any public post type and renders a grid that visitors can filter by taxonomy term without a page reload.

- **Post types and taxonomies are read from the site**, not hardcoded. A custom post type registered by a theme or another plugin appears in the Inspector with no code change, and the "Filter by" list only shows taxonomies actually registered for the selected post type.
- **The editor preview queries real entries** through `core-data`, so what an editor configures is what ships. It is not a static placeholder image.
- **Front-end filtering runs on the Interactivity API.** No jQuery, no hand-rolled event listeners.
- **Every entry is in the server-rendered HTML.** Filtering only hides what is already there, so the full list is present for crawlers and for anyone with JavaScript disabled.
- Ships as a block **variation** (compact rows) rather than a second block, because only the defaults differ.

### Spec Card (static)

A card with a fixed heading and a free-form InnerBlocks body.

- The structural split is the point: the heading is a bound `RichText`, the body is `InnerBlocks`. An editor can put a list, an image or a button group inside without being able to break the card.
- Padding, colour, border and typography all come from **block supports**, so a theme restyles the card from `theme.json` without touching this plugin.
- Static, so the markup survives the plugin being deactivated. For presentational content someone wrote by hand, that is the right trade-off.

---

## Decisions worth explaining

**Registering from `block.json` is a performance decision, not just a style one.** It is what lets WordPress enqueue each block's stylesheet only on pages where the block is present. On a content site, that is the difference between one render-blocking stylesheet on every page and none on most of them.

**`no_found_rows` on the directory query.** The block never paginates, so there is no reason to let `WP_Query` run the `SQL_CALC_FOUND_ROWS` pass for a row count nothing reads. On a large post table that pass is most of the query cost.

**The filter list is derived from terms actually present on the results**, not from every term in the taxonomy. Listing terms that match nothing produces filters that return an empty grid, which reads as a broken page. It also means a filter can never return zero results, which is why there is no empty state to render.

**The block renders nothing when there are no entries.** An empty wrapper with padding and a filter bar looks like a broken section. Returning `''` means the page simply does not have that section.

**`post_type_exists()` before querying.** Without it, `WP_Query` falls back to `post` when a post type is deactivated, and the block silently renders the wrong content rather than nothing. That failure is much harder to diagnose than an empty block.

**A mismatched taxonomy is surfaced in the editor.** If the chosen taxonomy is not registered for the chosen post type, the filter bar would render empty on the front end. The editor says so instead of letting it ship.

**Minimum 44px touch targets on the filter pills**, which a pill button misses by default at normal font sizes, and focus rings are thickened rather than removed.

---

## Development

```bash
npm install
npm run build        # production build into build/
npm start            # watch mode
npm run lint:js
npm run lint:css
```

A local WordPress is included via `@wordpress/env`, which needs Docker running:

```bash
npm run env:start    # http://localhost:8888, admin / password
npm run env:stop
```

---

## Layout

```
directory-blocks.php        Plugin bootstrap, block and category registration
includes/class-query.php    Query and filter derivation, kept out of the template
src/directory/              Dynamic block
  block.json                Metadata, attributes, supports, styles
  index.js                  Registration and the compact variation
  edit.js                   Editor UI, live preview via core-data
  view.js                   Interactivity API store for front-end filtering
  render.php                Server-side template
  style.scss / editor.scss
src/spec-card/              Static block
  block.json
  index.js / edit.js / save.js
  style.scss
```

---

## Scope

This is a reference implementation, not a plugin I am shipping to the directory. It has no settings page, no admin UI beyond the blocks, and no PHPUnit suite. The query layer is separated from the template specifically so tests could be added against a real WordPress test harness, but there are none here and I would rather say so than imply otherwise.

## License

GPL-2.0-or-later.
