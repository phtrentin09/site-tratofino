/**
 * Busca a nota e as avaliações do Trato Fino no Google e grava em avaliacoes.json.
 *
 * Roda sozinho uma vez por dia pelo GitHub Actions, mas você também pode rodar na mão:
 *
 *     GOOGLE_MAPS_API_KEY=sua-chave node scripts/atualiza-avaliacoes.mjs
 *
 * Na primeira vez ele descobre o identificador do lugar pelo nome e endereço, e imprime
 * esse identificador no fim. Guarde em PLACE_ID para as próximas execuções: fica mais
 * rápido, mais barato e imune a confusão com outro estabelecimento de nome parecido.
 */

import { writeFile, readFile } from "node:fs/promises";

const CHAVE = process.env.GOOGLE_MAPS_API_KEY;
const BUSCA = "Tratofino Pet Shop e Creche, Av. Sen. Salgado Filho, 5414, Uberaba, Curitiba, PR";
const DESTINO = new URL("../avaliacoes.json", import.meta.url);
const MAX = 6;

if (!CHAVE) {
  console.error("Falta a chave. Defina GOOGLE_MAPS_API_KEY e rode de novo.");
  process.exit(1);
}

async function google(url, campos) {
  const r = await fetch(url, {
    headers: { "X-Goog-Api-Key": CHAVE, "X-Goog-FieldMask": campos, "Content-Type": "application/json" },
  });
  if (!r.ok) throw new Error(`Google respondeu ${r.status}: ${(await r.text()).slice(0, 300)}`);
  return r.json();
}

async function descobrirLugar() {
  const r = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "X-Goog-Api-Key": CHAVE,
      "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ textQuery: BUSCA, languageCode: "pt-BR", regionCode: "BR" }),
  });
  if (!r.ok) throw new Error(`Busca falhou: ${r.status} ${(await r.text()).slice(0, 300)}`);
  const { places = [] } = await r.json();
  if (!places.length) throw new Error("Nenhum lugar encontrado para essa busca.");
  console.log(`Encontrado: ${places[0].displayName?.text} (${places[0].formattedAddress})`);
  return places[0].id;
}

const placeId = process.env.PLACE_ID || (await descobrirLugar());

const campos = "id,displayName,rating,userRatingCount,googleMapsUri,reviews";
const lugar = await google(
  `https://places.googleapis.com/v1/places/${placeId}?languageCode=pt-BR&regionCode=BR`,
  campos
);

const avaliacoes = (lugar.reviews || [])
  .filter((r) => (r.text?.text || r.originalText?.text || "").trim())
  .slice(0, MAX)
  .map((r) => ({
    nome: r.authorAttribution?.displayName || "Cliente",
    foto: r.authorAttribution?.photoUri || "",
    perfil: r.authorAttribution?.uri || "",
    nota: r.rating ?? null,
    quando: r.relativePublishTimeDescription || "",
    texto: (r.text?.text || r.originalText?.text || "").trim(),
    link: r.googleMapsUri || lugar.googleMapsUri || "",
  }));

const dados = {
  atualizadoEm: new Date().toISOString(),
  placeId: lugar.id,
  nota: lugar.rating ?? null,
  total: lugar.userRatingCount ?? null,
  linkGoogle: lugar.googleMapsUri || "",
  avaliacoes,
};

// se o Google devolver uma resposta vazia, mantém o que já estava no ar
if (!dados.nota && !avaliacoes.length) {
  console.error("A resposta veio sem nota e sem avaliações. O arquivo atual foi mantido.");
  process.exit(1);
}

let anterior = null;
try { anterior = JSON.parse(await readFile(DESTINO, "utf8")); } catch {}
const mudou =
  !anterior ||
  anterior.nota !== dados.nota ||
  anterior.total !== dados.total ||
  JSON.stringify(anterior.avaliacoes) !== JSON.stringify(dados.avaliacoes);

if (!mudou) {
  console.log("Nada mudou desde a última consulta.");
  process.exit(0);
}

await writeFile(DESTINO, JSON.stringify(dados, null, 2) + "\n");
console.log(`Gravado: nota ${dados.nota}, ${dados.total} avaliações, ${avaliacoes.length} com texto.`);
if (!process.env.PLACE_ID) console.log(`Guarde este PLACE_ID: ${lugar.id}`);
