# Controle da Moto

Aplicativo mobile-first para registrar abastecimentos e acompanhar o consumo da motocicleta.

## Persistência

- Neon PostgreSQL é a fonte de verdade.
- Banco: `neondb`
- Branch: `production`
- Tabela principal: `public.abastecimentos`
- A interface publicada no GitHub Pages usa a Neon Data API.
- Nenhuma `DATABASE_URL`, senha ou credencial privada é colocada no frontend.
- `localStorage` não é usado como banco de dados.

## Abastecimentos

A tela principal permite:

- data e hora editáveis;
- quilometragem;
- valor abastecido;
- preço por litro;
- cálculo automático de litros;
- combustível;
- posto;
- observações;
- preenchimento automático de combustível, posto, preço e observações do último abastecimento;
- edição e exclusão;
- histórico do mais recente para o mais antigo;
- consumo médio e custo médio por km;
- atualização real dos dados no Neon pelo botão **Atualizar**.

## API

A camada HTTP é a Neon Data API, com a tabela `abastecimentos` exposta no endpoint REST do banco. A aplicação usa os métodos HTTP correspondentes:

- GET para leitura;
- POST para cadastro;
- PATCH para edição;
- DELETE para exclusão.

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

Após alterações, validar:

1. carregamento da página;
2. autenticação anônima do Neon;
3. GET;
4. INSERT;
5. UPDATE;
6. DELETE;
7. cálculo de litros;
8. cálculo de consumo;
9. atualização sem recarregamento manual;
10. preenchimento automático;
11. teclado numérico no celular;
12. data/hora da última atualização.

Última atualização do projeto: 03/10/2026.
