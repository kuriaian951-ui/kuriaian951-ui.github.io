# Ian Kuria portfolio

Live site: https://kuriaian951-ui.github.io/

A static portfolio built with plain HTML, CSS and JavaScript. There is no build step: edit the files and push to `main`, and GitHub Pages publishes them.

## Files

- `index.html` holds all the page content.
- `styles.css` holds the design.
- `script.js` handles the menu, work filters, video player, CV viewer and both forms.
- `reviews.js` holds client reviews.
- `assets/` holds images, the media kit PDF and the social-share image.

## Adding a client review

The reviews section shows only real reviews. Open `reviews.js`, add the review inside the list in the format shown at the top of that file, and push. Add a review only after the client has confirmed it. New reviews sent through the site's review form arrive by email through Web3Forms.

## Adding a project

Copy one of the `<article class="work">` blocks inside the work grid in `index.html`, set `data-cat` to `video`, `brand` or `cv`, and replace the text, image and link.

## Forms

Both forms send to Ian's inbox through Web3Forms. The access key is in `script.js`.
