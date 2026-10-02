# Moto — Controle de gastos da moto

Aplicação mobile-first para acompanhar os custos e o histórico de uma moto.

## Recursos
- Cadastro da moto: marca, modelo, ano de fabricação, ano do modelo, placa e KM inicial.
- Abastecimentos: data, KM, valor total, preço/litro, tipo de combustível, posto e observações.
- Cálculo automático dos litros, distância e consumo em km/L.
- Preenchimento automático dos dados do último abastecimento.
- Manutenções: data, KM, peça/serviço, preço, tipo, loja/oficina, telefone, próxima troca por KM/data e observações.
- Despesas gerais: IPVA, seguro, lavagem, estacionamento, pedágio, acessórios, documentação, multa e outros.
- Histórico geral com busca.
- Exclusão de registros.
- Interface mobile-first.

## Persistência no Neon

Os dados da aplicação são persistidos no PostgreSQL do Neon, no projeto `sparkling-sea-76150935`, branch `production`.

Tabelas:
- `public.moto_vehicle`
- `public.moto_fuel`
- `public.moto_maintenance`
- `public.moto_expense`

A aplicação pública no GitHub Pages chama uma Neon Function HTTP em:
`/health`, `/bootstrap`, `/vehicle`, `/fuel`, `/maintenance` e `/expense`.

A Function usa `DATABASE_URL` injetada pelo Neon e `pg` com pool compartilhado. O navegador não grava novos registros em `localStorage`; o banco Neon é a fonte de verdade. Existe apenas uma migração automática de dados antigos da versão anterior que ainda estejam no navegador.

## Arquivos Neon
- `neon.ts`: configuração do projeto/Function.
- `src/index.ts`: API da Function.
- `sql/001_moto.sql`: schema e índices do banco.

## Deploy
Projeto Neon: `sparkling-sea-76150935`
Branch: `production`
Branch ID: `br-noisy-resonance-b594p7s8`
Function: `api`
Runtime: Node.js 24
