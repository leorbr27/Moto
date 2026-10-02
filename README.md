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

Os dados são persistidos no PostgreSQL do Neon, no projeto `sparkling-sea-76150935`, branch `production`.

Tabelas:
- `public.moto_vehicle`
- `public.moto_fuel`
- `public.moto_maintenance`
- `public.moto_expense`

A aplicação no GitHub Pages usa a Neon Data API como camada HTTP de persistência. O banco Neon é a fonte de verdade; novos lançamentos não são gravados no navegador. Existe somente uma migração automática de dados antigos da versão anterior que ainda estejam no navegador.

## Neon
- Projeto: `sparkling-sea-76150935`
- Branch: `production`
- Branch ID: `br-noisy-resonance-b594p7s8`
- Data API: `https://ep-holy-sky-b5qingk3.apirest.c-7.us-east-2.aws.neon.tech/neondb/rest/v1`
- `neon.ts`: configuração do Neon Auth.
- `sql/001_moto.sql`: schema e índices do banco.

A região `aws-us-east-2` atende ao requisito regional do Neon Functions, mas a implantação da Function foi diagnosticada como incompatível com o bundle enviado; para a aplicação estática, a Data API fornece diretamente os endpoints HTTP necessários e evita credenciais de banco no frontend.

