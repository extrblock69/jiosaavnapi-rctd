const fs = require('fs');
const file = 'backend/jiosaavn-api-main/src/modules/artists/controllers/artist.controller.ts';
let content = fs.readFileSync(file, 'utf8');

const regexFix = `        let response = null
        let token = link || ''

        if (link) {
          const match = link.match(/jiosaavn\\.com\\/artist\\/[^/]+\\/([^/]+)$/)
          if (match) {
            token = match[1]
          }
          response = await this.artistService.getArtistByLink({ token, page, songCount, albumCount, sortBy, sortOrder })
        } else {
          response = await this.artistService.getArtistById({ artistId: id!, page, songCount, albumCount, sortBy, sortOrder })
        }`;

content = content.replace(/        let response = null[\s\S]*?\} else \{[\s\S]*?response = await this\.artistService\.getArtistById\(\{ artistId: id!, page, songCount, albumCount, sortBy, sortOrder \}\)[\s\S]*?\}/, regexFix);

fs.writeFileSync(file, content);
