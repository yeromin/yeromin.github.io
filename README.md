# Warsaw projects

The GitHub Pages homepage links to the [Warsaw sunset tracker](https://yeromin.github.io/warsaw-sunset/) and the [Mikrowyprawy z Warszawy trip guide](https://yeromin.github.io/mikrowyprawy/).

The trip guide is a static index of places and posts from [@mikrowyprawy_z_warszawy](https://www.instagram.com/mikrowyprawy_z_warszawy/). Edit `mikrowyprawy/data/catalog.json` to maintain place descriptions, access checks, Google Maps links, and post associations. Place IDs are stable. Suggested ages describe likely interest. Verified access reflects the linked source and check date.

English and Ukrainian are available in the homepage, trip guide, and post index. The language choice is saved in the visitor's browser. Update interface strings in `assets/i18n.js` and Ukrainian catalog labels in `mikrowyprawy/catalog.js`. The `mikrowyprawy/data/catalog.uk.json` file maps original English descriptions and access notes to Ukrainian. Keep official place names and source links in `catalog.json`.

The trip guide calculates straight-line distances from Warsaw centre or a starting point saved locally in the visitor's browser. Visitors can enter a city name, paste coordinates, or use their current location. The distance filter includes area estimates by default. Choose **Place pins** to limit results to a mapped venue, address, or access point.

City lookup uses `mikrowyprawy/data/cities.json`, with rows of `[name, country code, area, latitude, longitude, optional aliases]`. The Polish city centres come from [Geoportal's national register of geographical names](https://www.geoportal.gov.pl/en/data/national-register-of-geographical-names/). International city centres come from the [GeoNames `cities15000`, `admin1CodesASCII`, and `admin2Codes` downloads](https://www.geonames.org/export/dump/) under [CC BY](https://www.geonames.org/export/).

Additional locations live in `mikrowyprawy/data/place-pins.json`, keyed by place ID. `place` points identify a destination or access point. `area` points represent a named street, neighbourhood, town, or route. Sources are linked in the place details.

Coordinate sources include [the profile authors' map](https://mikrowyprawyzwarszawy.pl/mapa/), [OpenStreetMap contributors](https://www.openstreetmap.org/copyright) under the [Open Database License](https://opendatacommons.org/licenses/odbl/1-0/), [Overture Maps Places](https://docs.overturemaps.org/attribution/), and [Geoportal](https://www.geoportal.gov.pl/en/data/national-register-of-geographical-names/).

Serve the repository root with `python3 -m http.server 8000` for local preview. The site requires no build step. Cover images are illustrative. The font licenses are in `assets/`.
