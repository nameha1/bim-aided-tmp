Place the 4 photos you attached into the project's `public/images/` folder using the filenames below. The About page (`app/about/page.tsx`) references these exact paths.

Recommended filenames (drop the images into `public/images/`):

- public/images/about-team-1.jpg
- public/images/about-team-2.jpg
- public/images/about-team-3.jpg
- public/images/about-team-4.jpg

Notes:
- Filenames should be all-lowercase and match exactly (including extension).
- Prefer JPEGs with reasonable web sizes (e.g., 1000–2500px width). The page uses `object-cover` with a fixed height for the gallery.
- If you need me to add automatic image optimization or placeholders, I can wire in `next/image` components instead.

How to copy the attachments into the repo (example macOS commands):

1. Save the 4 attachment files to a local folder (e.g., `~/Downloads/about-photos`).
2. Create the images directory in the repo if it doesn't exist:

```bash
mkdir -p "public/images"
```

3. Copy files into the repo and rename as needed:

```bash
cp ~/Downloads/about-photo1.jpg "public/images/about-team-1.jpg"
cp ~/Downloads/about-photo2.jpg "public/images/about-team-2.jpg"
cp ~/Downloads/about-photo3.jpg "public/images/about-team-3.jpg"
cp ~/Downloads/about-photo4.jpg "public/images/about-team-4.jpg"
```

After copying, rebuild the app (or run the dev server) and visit `/about` to confirm the gallery appears.
