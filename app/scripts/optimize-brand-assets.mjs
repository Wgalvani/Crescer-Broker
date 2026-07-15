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

/*
 * Lockup principal do programa, em alta resolucao.
 *
 * O PROBLEMA: logo-crescer-brokers.png (323x231) e o unico lockup com
 * transparencia, e e pequeno demais para uma posicao de destaque -- ampliado
 * ele borra. A arte de capa tem o MESMO lockup 5,4x maior (1656px uteis), mas
 * chapado sobre o fundo verde com hexagonos, sem alfa.
 *
 * POR QUE NAO UM CHROMA KEY: os hexagonos do fundo sao verde-limao vivo, a
 * mesma distancia cromatica do fundo que o proprio logo -- medido. Nenhum key
 * por cor os separa, e ha hexagonos dentro da area do logo.
 *
 * A SAIDA: o PNG pequeno ja tem o recorte certo, so que em baixa resolucao. Ele
 * entra como MASCARA -- seu alfa, ampliado, isola o logo dentro da arte em alta.
 * O miolo (texto, triangulo) sai na resolucao da arte; so as bordas herdam a
 * suavidade do alfa ampliado, o que a olho nu nao se distingue do antialiasing.
 *
 * Bordas e sombras saem compostas sobre o verde da arte, e nao transparentes.
 * Isso e proposital e so funciona porque o fundo da arte usa exatamente os
 * tokens do tema (#04411a -> #010d05, ver index.css): sobre o verde do login,
 * assentam sem emenda. NAO reaproveite este arquivo sobre fundo claro.
 */
async function bboxBrancoAzul(input) {
  // Referencia de alinhamento: so branco e azul. Exclui os hexagonos lime, que
  // existem na arte e nao no PNG pequeno e desalinhariam a medida.
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const box = { minX: info.width, minY: info.height, maxX: 0, maxY: 0 }
  let achou = false

  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const i = (y * info.width + x) * info.channels
      const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]]
      if (a < 40) continue
      const branco = r > 200 && g > 200 && b > 200
      const azul = b > 110 && b > r + 60 && b > g + 40
      if (!branco && !azul) continue
      achou = true
      if (x < box.minX) box.minX = x
      if (x > box.maxX) box.maxX = x
      if (y < box.minY) box.minY = y
      if (y > box.maxY) box.maxY = y
    }
  }

  if (!achou) throw new Error(`Nenhum pixel branco/azul em ${input} -- a arte mudou?`)
  return { ...box, w: box.maxX - box.minX + 1, h: box.maxY - box.minY + 1 }
}

{
  const arte = path.join(SOURCE, 'logo-crescer-brokers-lockup.png')
  const mascara = path.join(SOURCE, 'logo-crescer-brokers.png')

  const bbArte = await bboxBrancoAzul(arte)
  const bbMasc = await bboxBrancoAzul(mascara)

  const escalaX = bbArte.w / bbMasc.w
  const escalaY = bbArte.h / bbMasc.h

  // Trava de sanidade: se as proporcoes divergirem, os dois arquivos deixaram de
  // ser a mesma arte e o alinhamento abaixo produziria um recorte torto -- e
  // silenciosamente, que e o pior modo de falhar.
  if (Math.abs(escalaX - escalaY) / escalaX > 0.02) {
    throw new Error(
      `Lockup: proporcoes divergem (x=${escalaX.toFixed(3)}, y=${escalaY.toFixed(3)}). ` +
        'logo-crescer-brokers.png e logo-crescer-brokers-lockup.png ainda sao a mesma arte?'
    )
  }

  const escala = (escalaX + escalaY) / 2
  const { width: mw, height: mh } = await sharp(mascara).metadata()
  const largura = Math.round(mw * escala)
  const altura = Math.round(mh * escala)

  const alfa = await sharp(mascara)
    .resize(largura, altura, { kernel: 'lanczos3' })
    .extractChannel('alpha')
    .toBuffer()

  const recorte = await sharp(arte)
    .extract({
      left: Math.round(bbArte.minX - bbMasc.minX * escala),
      top: Math.round(bbArte.minY - bbMasc.minY * escala),
      width: largura,
      height: altura,
    })
    .removeAlpha()
    .toBuffer()

  // A mascara TEM que ser aplicada num passe proprio, e so depois redimensionar:
  // o sharp roda resize antes de joinChannel dentro do mesmo pipeline, o que
  // colaria um alfa de 1758px numa base ja reduzida a 800px e produziria lixo.
  const comAlfa = await sharp(recorte).joinChannel(alfa).png().toBuffer()

  // 800px: a UI exibe o lockup em ~400px (ver AuthLayout), entao isto cobre 2x
  // com folga. Servir os 1758px extraidos custaria ~180 KB para nada -- a tela
  // de login precisa abrir em 3G/4G instavel (PRD secao 7).
  const { width, height } = await sharp(comAlfa)
    .trim({ threshold: 10 })
    .resize({ width: 800, withoutEnlargement: true })
    .webp({ quality: 92, alphaQuality: 100 })
    .toFile(path.join(OUT, 'lockup-crescer-brokers.webp'))

  console.log(
    `Lockup extraido da arte em alta e servido a ${width}x${height} (fonte: ${escala.toFixed(2)}x o PNG pequeno)`
  )
}

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
