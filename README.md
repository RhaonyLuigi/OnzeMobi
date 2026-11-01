# ONZE mobi

Repositório: [RhaonyLuigi/onze-mobi](https://github.com/RhaonyLuigi/onze-mobi).

Prévia para a equipe: [abrir ONZE mobi](https://rhaonyluigi.github.io/onze-mobi/).

## Prévia no GitHub Pages

A publicação é feita automaticamente pelo workflow **Publish app to GitHub Pages** a cada atualização da branch `main`. Ele instala as dependências, verifica TypeScript e lint, gera a versão web e publica o resultado. O progresso aparece na aba **Actions** do repositório. A prévia é pública e usa os mesmos dados demonstrativos do app local.

O comando `npm run build:pages` gera `dist-pages` com as páginas estáticas e o prefixo `/onze-mobi`. Essa configuração fica isolada em `app.config.ts` e no script de exportação: `npm run web` e os builds Android/iOS continuam com seus caminhos normais. Os arquivos gerados não precisam ser enviados manualmente ao GitHub.

Front-end mobile em React Native, Expo e TypeScript, implementado a partir do [design no Figma](https://www.figma.com/design/38myHc0zWLNJBN1GMdZskU/Sem-t%C3%ADtulo?node-id=0-1).

## Executar

Requer Node.js e npm. Dentro desta pasta:

```sh
npm install
npm run web
```

Para visualizar no celular, execute `npm start` e abra o projeto em uma versão do Expo Go compatível com o SDK 58, ou em um development build. O computador e o celular precisam estar na mesma rede. `npm run android` abre um emulador Android já configurado. A execução em simulador iOS exige macOS.

## Explorar a prévia

No login, informe um e-mail ou telefone e uma senha de exemplo. Não existe autenticação remota. Também é possível escolher **Continuar com Google → Explorar prévia**.

- Splash, login, cadastro e recuperação de senha.
- Início com estado inicial e recarga em andamento.
- Mapa com pesquisa, seleção dos três carregadores do design e escolha de conector.
- QR Code visual e entrada manual de um código de exemplo, como `ONZE001`.
- Garagem com cadastro, edição, remoção e seleção de veículos.
- Simulação com controles de bateria, meta e potência.
- Aba Viagem com conversa demonstrativa, origem/destino, veículo, comparação de prioridades e lista de paradas ilustrativas. A conversa é preservada ao navegar e ao reabrir o app.
- Configuração, orçamento, confirmação, acompanhamento e conclusão de recarga.
- Perfil e janelas para conta, pagamento de exemplo, preferências e histórico.

Para finalizar uma sessão, abra **Detalhes da recarga → Concluir recarga de exemplo**. O resultado é salvo no histórico local. Veículos, perfil, preferências, cartão de exemplo e sessão também são preservados no dispositivo.

Na aba **Viagem**, escreva o destino e depois a origem, ou uma mensagem como **De Brasília para Goiânia**. Compare **Menor tempo**, **Menor custo** e **Menos paradas**, e expanda a lista de recargas. O cenário local usa uma distância hipotética de **420 km**, independente das cidades informadas. Não há modelo de IA, geocodificação, cálculo de estradas ou consulta de eletropostos reais conectados. Os nomes dos postos são explicitamente exemplos. O módulo `src/features/trip.ts` concentra os dados e cálculos demonstrativos para posterior substituição por uma integração real.

A tela de **recarga** mostra bateria inicial/atual/meta, energia adicionada e restante, potência média, tempo restante, autonomia ilustrativa, preço por kWh e identificação do veículo/carregador. O botão **Voltar para o início** fica fixo no rodapé e mantém a sessão ativa. As informações também alimentam o resumo do início e a janela de detalhes. São valores de demonstração, sem telemetria real. Novas sessões guardam uma cópia do veículo e da meta para que esses dados não mudem ao navegar.

**Escopo:** somente front-end. Mapa, carregadores, capacidades, preços e sessões são dados de demonstração; não consulte esta prévia para planejar uma recarga real. Não há servidor, GPS, autenticação Google, recuperação por SMS/e-mail, câmera ou pagamentos reais. Use apenas dados de exemplo. As janelas secundárias sem um frame próprio no arquivo usam os mesmos componentes visuais do app.

## Organização

- `src/app`: rotas e layout do Expo Router.
- `src/screens`: telas e janelas.
- `src/components.tsx`: componentes compartilhados e layout adaptável.
- `src/design`: cores, tipografia e referências aos assets locais.
- `src/state.tsx`: navegação, cálculos e persistência com AsyncStorage.
- `src/features`: modelo da conversa, planos demonstrativos e resumo compartilhado da recarga.
- `assets/figma`: imagens e SVGs originais, sem URLs temporárias em execução.
- `design/reference`: referências locais do Figma, não versionadas por conterem links temporários. O app usa os assets já incluídos em `assets/figma`.
- `tests`: testes dos fluxos de usuário.
- `qa/screenshots`: saída local de capturas e geometria dos assets para revisão visual.
- `qa/feedback`: saída local de capturas da aba Viagem e da recarga ampliada em dois tamanhos de celular. Esses arquivos são gerados pelos scripts e não são versionados.

As telas seguem a referência de 402 × 874 pontos. Em alturas menores, o conteúdo rola e a navegação continua acessível. No navegador, a moldura central mantém a largura de um celular; em Android/iOS, são usados os componentes nativos e as áreas seguras do aparelho.

## Verificar e gerar

```sh
npm run typecheck
npm run lint
npx playwright install chromium
npm test
npm run build
```

Os testes cobrem validação de login, pesquisa e seleção no mapa, mudança do orçamento pelo controle de carga, conclusão e persistência da sessão, cadastro/remoção de veículo, entrada manual de código e navegação em uma tela de 360 × 740. O Playwright inicia a prévia automaticamente quando necessário.

Os testes adicionais verificam o acesso à Viagem com recarga ativa, conversa com origem/destino, validação de cidades iguais, comparação de custo, persistência do plano, nova conversa e retorno ao início com o botão fixo da recarga.

`npm run build` exporta os bundles web, Android e iOS para `dist`. Essa exportação não produz um APK/IPA nem publica o app nas lojas. Nenhum serviço externo de produção foi configurado.

## Atualizações pelo chat

As alterações solicitadas neste projeto/chat devem ser validadas, registradas em commits e enviadas ao repositório configurado como `origin`, salvo pedido explícito para manter o trabalho apenas local. Essa preferência também está registrada em `AGENTS.md`. A sincronização ocorre a cada solicitação atendida; não há monitoramento em segundo plano.
