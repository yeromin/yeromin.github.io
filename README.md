# Warsaw projects

The GitHub Pages homepage links to the [Warsaw sunset tracker](https://yeromin.github.io/warsaw-sunset/) and the [Mikrowyprawy z Warszawy trip guide](https://yeromin.github.io/mikrowyprawy/).

The trip guide is a static index of places and posts from [@mikrowyprawy_z_warszawy](https://www.instagram.com/mikrowyprawy_z_warszawy/). Edit `mikrowyprawy/data/catalog.json` to maintain place descriptions, access checks, Google Maps links, and post associations. Place IDs are stable. Suggested ages describe likely interest. Verified access reflects the linked source and check date.

The trip guide calculates straight-line distances from Warsaw centre or a starting point saved locally in the visitor's browser. The distance filter includes area estimates by default. Choose **Place pins** to limit results to a mapped venue, address, or access point.

Additional locations live in `mikrowyprawy/data/place-pins.json`, keyed by place ID. `place` points identify a destination or access point. `area` points represent a named street, neighbourhood, town, or route. Sources are linked in the place details.

Coordinate sources include [the profile authors' map](https://mikrowyprawyzwarszawy.pl/mapa/), [OpenStreetMap contributors](https://www.openstreetmap.org/copyright) under the [Open Database License](https://opendatacommons.org/licenses/odbl/1-0/), [Overture Maps Places](https://docs.overturemaps.org/attribution/), and [Geoportal](https://www.geoportal.gov.pl/en/data/national-register-of-geographical-names/).

Serve the repository root with `python3 -m http.server 8000` for local preview. The site requires no build step. Cover images are illustrative. The font licenses are in `assets/`.
