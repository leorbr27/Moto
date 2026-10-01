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
