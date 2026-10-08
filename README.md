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
- **Não há autenticação, login ou senha.** O sistema funciona diretamente como acesso anônimo.

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

## Acesso aos dados

A Neon Data API está configurada para usar a role anônima do banco. A tabela `public.abastecimentos` possui política RLS para permitir CRUD ao role `anonymous`.

A aplicação faz chamadas HTTP diretamente à Data API, sem token JWT, sessão, OAuth ou SDK de autenticação.

## Última atualização

O rodapé da tela principal consulta o commit mais recente da branch `main` do GitHub e mostra a data/hora desse commit no horário de Brasília.

## API

A camada HTTP é a Neon Data API, com a tabela `abastecimentos` exposta no endpoint REST do banco. A aplicação usa:

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

Após a remoção da autenticação, validar:

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
13. data da última alteração registrada no GitHub.

Última atualização documentada: 08/10/2026.
