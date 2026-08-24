# Site do Trato Fino Pet Shop e Creche

Site institucional da Trato Fino Pet Shop e Creche, na Av. Sen. Salgado Filho, 5414, Uberaba,
Curitiba/PR. São páginas HTML estáticas, sem framework e sem etapa de build: o que está aqui é
exatamente o que vai para o ar.

## Como rodar na sua máquina

Abrir o `index.html` direto no navegador quase funciona, mas as avaliações do Google e o mapa
precisam de um servidor. Prefira:

```bash
python3 -m http.server 8000
# depois abra http://localhost:8000
```

## Publicar no Vercel

O projeto não precisa de configuração. No Vercel, importe este repositório e deixe tudo no padrão:

- Framework Preset: **Other**
- Build Command: vazio
- Output Directory: vazio (a raiz do repositório)

Cada push na branch principal republica o site sozinho.

## Avaliações do Google

A home mostra a nota, o total de avaliações e três comentários, tudo vindo do `avaliacoes.json`.
Esse arquivo é atualizado **todo dia às 9h** pela rotina em `.github/workflows/avaliacoes.yml`,
que roda `scripts/atualiza-avaliacoes.mjs`, consulta o Google e faz commit se algo mudou.

### Ligar pela primeira vez

1. No [Google Cloud Console](https://console.cloud.google.com/), crie um projeto e ative a
   **Places API (New)**. É preciso cadastrar um cartão, mas com uma consulta por dia o volume
   fica muito abaixo do que é cobrado.
2. Crie uma chave de API. Em produção, restrinja a chave à Places API.
3. No GitHub, em Settings, Secrets and variables, Actions, crie o secret
   **`GOOGLE_MAPS_API_KEY`** com essa chave.
4. Na aba Actions, rode o workflow "Atualizar avaliações do Google" pelo botão **Run workflow**.
5. No fim do log aparece uma linha `Guarde este PLACE_ID: ...`. Crie um segundo secret
   **`PLACE_ID`** com esse valor. A partir daí a rotina não precisa mais procurar o
   estabelecimento pelo nome, e nunca corre o risco de pegar outro lugar parecido.

### Rodar na mão

```bash
GOOGLE_MAPS_API_KEY=sua-chave node scripts/atualiza-avaliacoes.mjs
```

### O que esperar

O Google entrega poucas avaliações por consulta, não todas as que existem no perfil, e não deixa
escolher quais. O site mostra as três primeiras que vierem com texto, junto com a nota geral e o
total, que aí sim refletem o perfil inteiro. O link "Ver todas no Google" leva ao perfil completo.

Enquanto a chave não estiver configurada, o site mostra a nota que está no `avaliacoes.json` e um
aviso discreto no lugar dos comentários. Nada quebra.

## Estrutura

```
index.html              Início
servicos.html           Creche, estética e pet shop
banho-e-tosa.html       Banho, tosa e pacote mensal
sobre.html              História, jeito de trabalhar, uniforme e mochila
galeria.html            Fotos, com visor de imagem ampliada
blog.html               Lista dos artigos
blog-*.html             Os três artigos
trabalhe-conosco.html   Vagas, com formulário
contato.html            Endereço, WhatsApp, horário e mapa
styles.css              Todo o estilo, com as cores da marca no topo do arquivo
main.js                 Menu, formulários, visor da galeria e avaliações
avaliacoes.json         Nota e comentários do Google, atualizados pela rotina
scripts/                O script que consulta o Google
.github/workflows/      A rotina diária
img/                    Fotos em WebP e a imagem de prévia de link (og.jpg)
```

## Modo revisão

Existem avisos internos marcando o que ainda precisa ser confirmado com o cliente (rotina da
creche, planos, preços, regras de admissão). Eles ficam **escondidos** para quem visita o site.

Para vê-los, acrescente `?revisao=1` no fim do endereço:

```
https://SEU-SITE/index.html?revisao=1
```

Quando todas as informações estiverem confirmadas, apague os blocos `<div class="rev">` das
páginas e o botão `id="revToggle"`.

## Coisas que valem saber antes de mexer

**Cores.** Estão como variáveis no começo do `styles.css`, em `:root`. Trocar ali muda o site
inteiro. Há um segundo bloco com as mesmas variáveis para o modo escuro do celular.

**Ícones.** Ficam num `<svg>` escondido no topo de cada página, e são usados por `<use href="#i-nome">`.
Mudar um desenho ali muda o ícone em todos os lugares daquela página.

**Fotos.** Todas em `img/`, em WebP. Para trocar uma, mantenha o mesmo nome de arquivo e o site
não precisa de nenhum ajuste.

**WhatsApp.** O número aparece nos links `wa.me/5541998015014` e no começo do `main.js`.
Se mudar, troque nos dois lugares.

**Endereço do site.** `sitemap.xml`, `robots.txt` e as tags de prévia de link (`og:`) usam o
endereço do site. Se o domínio mudar, é preciso atualizar esses três pontos.

## Pendências de conteúdo

1. História real da empresa: quem fundou, em que ano, se a creche veio depois do pet shop
2. Planos e preços da creche
3. Regras de admissão: castração, fêmeas no cio, idade mínima, vacinas exigidas
4. Se a creche aceita gatos ou se eles só fazem banho e tosa
5. Se existe leva e traz
6. Rotina do dia na creche
7. Lista real dos serviços de estética e se os valores vão aparecer
8. O que o pet shop vende
9. Foto da equipe, que é a única categoria sem imagem
