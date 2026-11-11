# Warsaw projects

The GitHub Pages homepage links to the [Warsaw sunset tracker](https://yeromin.github.io/warsaw-sunset/) and the [Mikrowyprawy z Warszawy trip guide](https://yeromin.github.io/mikrowyprawy/).

The trip guide is a static index of places and posts from [@mikrowyprawy_z_warszawy](https://www.instagram.com/mikrowyprawy_z_warszawy/). Edit `mikrowyprawy/data/catalog.json` to maintain place descriptions, access checks, Google Maps links, and post associations. Place IDs are stable. Suggested ages describe likely interest. Verified access reflects the linked source and check date.

Distances use public venue coordinates and a starting point chosen in the visitor's browser. Warsaw centre is the default. Locations without matched coordinates remain searchable.

Serve the repository root with `python3 -m http.server 8000` for local preview. The site requires no build step. Cover images are illustrative. The font licenses are in `assets/`.
