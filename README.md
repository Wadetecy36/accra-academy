# Accra Academy Website Prototype
A prototype homepage for Accra Academy, built with HTML, Tailwind CSS (standalone CLI), and AOS for animations.

## Project Structure
```
accra-academy-website
│   .gitignore
│   index.html
│   about.html
│   anniversary.html
│   contact.html
│   edit.html
│   package.json
│   push.bat
│   README.md
│   server.mjs
│   tailwind.config.js
│
├───assets
│       crest.png
│       crest.webp
│       crest1.png
│       entrance.jpg
│       entrance.webp
│       upscalemedia-transformed-1.webp
│
├───css
│       custom.css
│       input.css
│       styles.css
│
├───js
│       script.js
│
└───.fleet
```

## Setup
1. **Clone or Set Up the Repository**:
   - Ensure all files (`index.html`, `tailwind.config.js`, `css/input.css`, `css/custom.css`) are in place.
   - Place images in `assets/` (e.g., `crest.png`, `gallery1.jpg`). Use WebP for optimization.

2. **Download Tailwind Standalone CLI**:
   - Download `tailwindcss-linux-x64` from [Tailwind CSS Releases](https://github.com/tailwindlabs/tailwindcss/releases).
   - Save it to the project root and make it executable:
     ```bash
     mv tailwindcss-linux-x64 tailwindcss
     chmod +x tailwindcss
     ```

3. **Build CSS**:
   - Generate `css/styles.css`:
     ```bash
     ./tailwindcss -i ./css/input.css -o ./css/styles.css --minify
     ```
   - For development (auto-rebuild on changes):
     ```bash
     ./tailwindcss -i ./css/input.css -o ./css/styles.css --watch
     ```

4. **Verify Images**:
   - Convert images to WebP for performance:
     ```bash
     sudo apt install imagemagick
     convert crest.png crest.webp
     ```
   - Ensure `assets/` contains `crest.webp`, `gallery1.webp`, etc.

5. **Test Locally**:
   - Open `index.html` in a browser:
     ```bash
     firefox index.html
     ```
   - Check the console (F12 > Console) for no Tailwind CDN warnings and correct styling.

## Dependencies
- **Tailwind CSS**: Uses standalone CLI (no Node.js/npm required).
- **AOS**: Loaded via CDN for animations.
- **Google Fonts**: Inter and Merriweather for typography.

## Notes
- **Contact Form**: Replace `your-form-id` in `index.html`’s contact form with a valid Formspree ID. Sign up at [formspree.io](https://formspree.io).
- **Image Optimization**: Keep images under 100KB. Use WebP format (convert with Imagemagick or [Squoosh](https://squoosh.app/)).
- **Deployment**: For production, deploy to Netlify or GitHub Pages:
  - Push to a GitHub repo and link to Netlify.
  - Ensure `css/styles.css` is included in the repo (run build before deploying).

## Troubleshooting
- **CLI Fails**: Verify `tailwindcss` is executable (`chmod +x tailwindcss`) and paths are correct (`ls css/input.css tailwind.config.js`).
- **Styles Not Applying**: Run build command and check `css/styles.css` exists. Ensure `index.html` links to `./css/styles.css`.
- **Image Issues**: Confirm `assets/` paths in `index.html` match actual files.