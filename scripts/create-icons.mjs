import sharp from 'sharp';
const svg=Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="100" fill="#2e5141"/><text x="256" y="350" text-anchor="middle" font-family="Georgia" font-size="360" fill="#f9d55c">g</text></svg>');
await Promise.all([192,512].map(s=>sharp(svg).resize(s,s).png().toFile('public/icon-'+s+'.png')));
