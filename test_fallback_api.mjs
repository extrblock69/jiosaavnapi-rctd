const fetch = globalThis.fetch;
fetch("http://localhost:4000/api/artists?link=https://www.jiosaavn.com/artist/seedhe-maut-songs/-Seb0x3NsMw_")
.then(r => r.json())
.then(d => console.log("Direct API response for imported link: name =", d.data.name));
