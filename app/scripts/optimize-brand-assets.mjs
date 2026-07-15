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

/** Recorta a area opaca e reexporta em WebP com fundo transparente. */
async function trimToWebp(file, out, width, quality = 90) {
  const info = await sharp(path.join(SOURCE, file))
    .trim({ threshold: 10 })
    .resize({ width, withoutEnlargement: true })
    .webp({ quality, alphaQuality: 100 })
    .toFile(path.join(OUT, out))
  return info
}

// Lockup principal do programa: transparente, vai sobre o verde do login.
// O original tem 323x231 -- pequeno para uma posicao de destaque, por isso a
// UI o exibe em ~260px (ver AuthLayout) em vez de esticar e borrar. Ao obter
// um SVG ou uma exportacao maior, basta trocar o arquivo em assets/.
await trimToWebp('logo-crescer-brokers.png', 'lockup-crescer-brokers.webp', 646)

// Selo da campanha interna "Missao 1BI" -- tema do ano da empresa. Marca
// distinta do CRESCER+BROKERS, em roxo/laranja. 1120px cobre o uso maior, como
// marca d'agua de fundo do login (~560px em 2x); o mesmo arquivo serve o selo
// pequeno do rodape.
await trimToWebp('selo-missao-1bi.png', 'selo-missao-1bi.webp', 1120)

// O original vem com a marca em PRETO sobre fundo transparente, e ela e usada
// sobre o verde escuro do login. Recolorir para branco aqui, e nao no CSS:
// filter/mix-blend-mode no browser deixam a marca lavada e dependem da cor do
// fundo. Aqui o alfa original vira mascara de uma chapa branca, o que preserva
// o antialiasing das curvas e produz um PNG que funciona sobre qualquer fundo.
{
  const trimmed = await sharp(path.join(SOURCE, 'logo-nestle.png'))
    .trim({ threshold: 10 })
    .resize({ width: 480, withoutEnlargement: true })
    .png()
    .toBuffer()

  const { width, height } = await sharp(trimmed).metadata()
  const alpha = await sharp(trimmed).extractChannel('alpha').toBuffer()

  await sharp({
    create: { width, height, channels: 3, background: '#ffffff' },
  })
    .joinChannel(alpha)
    .png({ compressionLevel: 9 })
    .toFile(path.join(OUT, 'logo-nestle-white.png'))
}

console.log('Ativos de marca gerados em', OUT)
