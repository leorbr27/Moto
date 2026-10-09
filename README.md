# Controle da Moto

Aplicativo mobile-first para registrar abastecimentos e acompanhar o consumo da motocicleta.

## Persistência

- Neon PostgreSQL é a fonte de verdade.
- Banco: `neondb`
- Branch: `production`
- Tabela principal: `public.abastecimentos`
- A interface é publicada no GitHub Pages.
- O navegador **não acessa mais a Neon Data API diretamente**.
- O navegador chama uma Neon Function pública, e a Function acessa o PostgreSQL usando a `DATABASE_URL` injetada pelo Neon.
- Nenhuma `DATABASE_URL`, senha, JWT ou credencial privada é colocada no frontend.
- `localStorage` não é usado como banco de dados.
- **Não há autenticação, login ou senha.** O acesso é direto.

## Backend

A API do aplicativo está na Neon Function:

`motoapi`

URL:

`https://br-noisy-resonance-b594p7s8-motoapi.compute.c-7.us-east-2.aws.neon.tech/`

Rotas:

- `GET /abastecimentos`
- `POST /abastecimentos`
- `PATCH /abastecimentos?id=eq.<uuid>`
- `DELETE /abastecimentos?id=eq.<uuid>`
- `GET /despesas`
- `POST /despesas`
- `PATCH /despesas?id=eq.<uuid>`
- `DELETE /despesas?id=eq.<uuid>`
- `GET /manutencoes`
- `POST /manutencoes`
- `PATCH /manutencoes?id=eq.<uuid>`
- `DELETE /manutencoes?id=eq.<uuid>`

A origem permitida é `https://leorbr27.github.io`.

## Abastecimentos

A tela principal permite:

- data;
- quilometragem;
- valor abastecido;
- preço por litro;
- cálculo automático de litros;
- combustível;
- posto;
- observações;
- data do novo abastecimento pré-preenchida com a data atual;
- preenchimento automático de quilometragem, valor abastecido, preço por litro, combustível, posto e observações do último abastecimento;
- recálculo imediato dos litros ao alterar valor abastecido ou preço por litro;
- edição e exclusão;
- histórico do mais recente para o mais antigo;
- consumo médio e custo médio por km.

## Autenticação

A autenticação Neon Auth e o fluxo de login GitHub foram removidos do projeto.

O aplicativo não apresenta tela de login, senha ou OAuth.

## Última atualização

O rodapé da tela principal consulta o commit mais recente da branch `main` do GitHub e mostra a data/hora desse commit no horário de Brasília.

## Banco

A tabela contém:

- `id`
- `data_abastecimento`
- `quilometragem`
- `litros`
- `valor_total`
- `preco_litro`
- `combustivel`
- `posto`
- `observacoes`
- `created_at`
- `updated_at`

Há índices para data e quilometragem e trigger para atualização automática de `updated_at`.

## Regra de consumo

O primeiro abastecimento não gera consumo. A partir do segundo, cada consumo usa:

`(km atual - km anterior) / litros do abastecimento atual`

O consumo médio exibido é a distância total válida dividida pelos litros dos abastecimentos que possuem um abastecimento anterior válido.

## Diagnóstico

Após a migração para a API intermediária, validar:

1. carregamento da página;
2. acesso direto sem login;
3. GET;
4. INSERT;
5. UPDATE;
6. DELETE;
7. cálculo automático e imediato de litros;
8. data atual pré-preenchida em novo abastecimento;
9. cópia dos dados do último abastecimento para um novo registro;
10. cálculo de consumo;
11. atualização sem recarregamento manual;
12. teclado numérico no celular;
13. data da última alteração registrada no GitHub;
14. ausência de credenciais privadas no frontend.

Última atualização documentada: 08/10/2026.


## Despesas

A página `despesas.html` registra despesas gerais da motocicleta com data, categoria, descrição, valor, quilometragem opcional e observações. Inclui edição, exclusão, total acumulado, total do ano atual e resumo por quantidade de categorias. Categorias: IPVA, multas, licenciamento, seguro, documentação, estacionamento, acessórios, lavagem, pedágio e outros. Os registros são persistidos no Neon, sem login e sem uso de localStorage como banco.

## Dashboard

A página `dashboard.html` reúne os dados de abastecimentos, manutenção e despesas gerais, com seleção de mês, total de gastos no período, número de abastecimentos, litros, distância registrada, divisão de custos por tipo e despesas gerais por categoria. O dashboard consulta os dados na API Neon.

As tabelas `public.moto_expense` e `public.moto_maintenance` são criadas pela API quando necessário, sem alterar os registros existentes de abastecimento.

Últimas alterações: implementação das páginas Despesas e Dashboard e inclusão das rotas de API para despesas e manutenção (09/10/2026).
