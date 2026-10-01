# Moto — Controle de gastos da moto

Aplicação mobile-first para acompanhar os custos e o histórico de uma moto, inspirada nos recursos do Drivvo.

## Recursos da primeira versão
- Cadastro da moto: marca, modelo, ano de fabricação, ano do modelo, placa e KM inicial.
- Abastecimentos: data, KM, valor total, preço/litro, tipo de combustível, posto e observações.
- Cálculo automático dos litros abastecidos.
- Cálculo automático da distância desde o abastecimento anterior e do consumo em km/L.
- Manutenções: data, KM, peça/serviço, preço, tipo, loja/oficina, telefone, próxima troca por KM, próxima troca por data e observações.
- Despesas gerais: IPVA, seguro, lavagem, estacionamento, pedágio, acessórios, documentação, multa e outros.
- Resumo mensal.
- Aviso de manutenção próxima por quilometragem.
- Histórico geral com busca e filtro.
- Edição e exclusão de registros.
- Backup local em JSON.
- Dados armazenados localmente no navegador via localStorage.

## Arquitetura
Nesta etapa não existe banco de dados nem API. O armazenamento fica local para facilitar o uso offline. A estrutura de dados foi mantida separada das telas para que a próxima etapa possa migrar para Neon/Postgres sem mudar a experiência do usuário.

## Referência
A organização foi inspirada nas funcionalidades públicas do Drivvo: abastecimentos, consumo, despesas, serviços/manutenções, lembretes e relatórios.


## Alterações — 01/10/2026
- Corrigida a estrutura da aplicação para separar as áreas em páginas HTML independentes.
- A página inicial passou a abrir diretamente no cadastro de novo abastecimento.
- Criadas páginas independentes para Manutenção, Despesas, Histórico e Cadastro da moto.
- Criada folha de estilos compartilhada (style.css) para manter o visual clean e consistente.
- Criado JavaScript compartilhado (app.js) para centralizar o armazenamento local e os cálculos.
- A navegação entre os assuntos agora fecha a tela atual e abre a página correspondente.
- Mantido o armazenamento local nesta fase, sem banco de dados.

## Alterações — 01/10/2026 — versão multipágina funcional
- Publicados os arquivos `style.css`, `app.js`, `manutencao.html`, `despesas.html`, `moto.html` e `historico.html`.
- A página `index.html` agora inicia diretamente no lançamento de abastecimento.
- Os formulários gravam os dados no `localStorage` compartilhado entre todas as páginas.
- O abastecimento calcula automaticamente litros, distância desde o abastecimento anterior e consumo em km/L.
- Manutenção e despesas possuem cadastro e exclusão funcionando.
- O histórico reúne abastecimentos, manutenções e despesas em uma única tela com busca.
- A navegação foi alterada para links entre páginas HTML independentes, em vez de abas dentro de um único cartão.
