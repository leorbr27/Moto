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
- A autenticação usa Neon Auth, integrada ao mesmo projeto Neon.

## Acesso e autenticação

- `index.html` exige uma sessão autenticada do Neon Auth.
- O botão **Entrar** abre `auth.html`.
- `auth.html` usa Neon Auth/Better Auth para iniciar o login social com GitHub.
- Após o login, o usuário retorna para `index.html`.
- A sessão é mantida pelo Neon Auth; o frontend não armazena senha nem segredo OAuth.
- O provedor GitHub precisa estar habilitado/configurado no Neon Auth para o login social funcionar.
- O endereço publicado do GitHub Pages precisa estar configurado como origem confiável no Neon Auth.

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

## Última atualização

O rodapé da tela principal não usa mais a data/hora local para representar a atualização. Ele consulta o commit mais recente da branch `main` do GitHub e mostra a data/hora desse commit no horário de Brasília.

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
2. existência de sessão Neon Auth;
3. redirecionamento para `auth.html` quando não autenticado;
4. login social com GitHub;
5. retorno para `index.html`;
6. GET;
7. INSERT;
8. UPDATE;
9. DELETE;
10. cálculo automático e imediato de litros;
11. data atual pré-preenchida em novo abastecimento;
12. cópia dos dados do último abastecimento para um novo registro;
13. cálculo de consumo;
14. atualização sem recarregamento manual;
15. preenchimento automático;
16. teclado numérico no celular;
15. data da última alteração registrada no GitHub.

Última atualização documentada: 06/10/2026.
