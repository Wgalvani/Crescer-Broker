/*
 * Gera as versoes servidas ao browser a partir dos originais em ../assets.
 * Os originais ficam fora do build (assets/ e a fonte da verdade da marca);
 * so o resultado deste script chega ao usuario.
 *
 * Rodar apos qualquer troca de ativo de marca:  npm run brand:assets
 */
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const here = path.dirname(fileURLToPath(import.meta.url))
const SOURCE = path.resolve(here, '../../assets')
const OUT = path.resolve(here, '../public/brand')

await mkdir(OUT, { recursive: true })

// A arte da capa e o fundo da tela de login. 1920px cobre telas 1080p em 1x e
// fica aceitavel em 2x, ja que ela vive desfocada atras de um card.
await sharp(path.join(SOURCE, 'logo-crescer-brokers-lockup.png'))
  .resize({ width: 1920 })
  .webp({ quality: 82 })
  .toFile(path.join(OUT, 'cover-crescer-brokers.webp'))

// Recorte do selo (triangulo azul + wordmark). A caixa do logo dentro do
// original 3000x1688 e x 689..2346 / y 300..1456, medida por varredura de
// pixel (scripts/_measure.mjs); os 40px de folga sao margem de respiro.
await sharp(path.join(SOURCE, 'logo-crescer-brokers-lockup.png'))
  .extract({ left: 649, top: 260, width: 1738, height: 1237 })
  .resize({ width: 720 })
  .webp({ quality: 90 })
  .toFile(path.join(OUT, 'lockup-crescer-brokers.webp'))

// Branco sobre preto opaco, sem canal alfa: quem faz o preto sumir e o
// mix-blend-mode:screen do BrandLogo, que so funciona sobre fundo escuro.
await sharp(path.join(SOURCE, 'logo-nestle-white.png'))
  .resize({ width: 240 })
  .png({ compressionLevel: 9 })
  .toFile(path.join(OUT, 'logo-nestle-white.png'))

console.log('Ativos de marca gerados em', OUT)
