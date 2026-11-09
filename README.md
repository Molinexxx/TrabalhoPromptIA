# BossFit AI

Projeto acadêmico de uma aplicação web para planejar treinos e acompanhar a regularidade e a evolução dos exercícios. O código-fonte está reunido em [bossfit-ai-source.tar.gz](bossfit-ai-source.tar.gz).

## Funcionalidades presentes no código

- Autenticação, perfil e questionário com objetivos e preferências para montar um plano de treino.
- Sessão guiada de treino e registro de séries e desempenho.
- Histórico, mapa de consistência, gráficos de evolução e ranking.
- Imagens de exercícios com tratamento de falha e vídeos demonstrativos.
- Coach por chat, implementado com uma função do Supabase que chama o gateway de IA da Lovable.

## Tecnologias e estrutura

O arquivo compactado contém uma aplicação com **React 19, TypeScript, TanStack Start e Router, Vite, Tailwind CSS 4 e Supabase**. Os gráficos usam Recharts.

| Local dentro do pacote | Conteúdo |
| --- | --- |
| `src/routes/` | Telas, rotas e fluxos de autenticação, treino, evolução e coach. |
| `src/lib/` | Geração de treinos, progressão e outras regras da aplicação. |
| `src/components/` | Componentes de interface, incluindo mídia e mapa de consistência. |
| `supabase/migrations/` | Migrações incrementais, com alterações no banco e políticas de acesso. |
| `supabase/functions/coach-chat/` | Função que processa as mensagens do coach. |

## Como preparar a execução local

Use Node.js 22.12 ou superior e npm. A partir da raiz do repositório:

```bash
mkdir bossfit-ai
tar -xzf bossfit-ai-source.tar.gz -C bossfit-ai
cd bossfit-ai
npm install
```

### Banco e autenticação

Para testar os fluxos de cadastro, perfil e treino, use um projeto Supabase de desenvolvimento com o **esquema base do BossFit**. O arquivo compactado inclui migrações incrementais. A primeira já usa `public.profiles`, outra altera `public.performance_history` e o aplicativo grava em `public.workout_history`. A criação dessas três tabelas e suas políticas de acesso de base precisa vir do projeto original ou de uma exportação autorizada do esquema, sem dados pessoais.

Com o esquema base disponível, aplique em ordem cronológica as migrações ainda pendentes no ambiente de desenvolvimento. Use o endereço e a chave publicável desse ambiente e confirme que o cadastro por e-mail está habilitado no Supabase Auth. O botão de login com Google usa a integração da Lovable e requer configuração própria.

### Variáveis da aplicação

Na pasta extraída, junto ao `package.json`, crie um arquivo local `.env.local` para as variáveis que o Vite disponibiliza ao navegador:

```dotenv
VITE_SUPABASE_URL=<url-do-supabase-de-desenvolvimento>
VITE_SUPABASE_PUBLISHABLE_KEY=<chave-publicavel-do-projeto>
```

Para os fluxos que usam o middleware de autenticação no servidor, defina `SUPABASE_URL` e `SUPABASE_PUBLISHABLE_KEY` no ambiente do processo que inicia o Vite. `SUPABASE_SERVICE_ROLE_KEY` é usada apenas pelo cliente privilegiado do servidor. Mantenha esse valor fora das variáveis `VITE_*` e do repositório.

Com o banco e as variáveis preparados, execute `npm run dev` na pasta extraída e abra a URL exibida pelo Vite.

### Coach por chat

Para testar o chat, disponibilize a função `supabase/functions/coach-chat/` no mesmo Supabase de desenvolvimento e configure `LOVABLE_API_KEY` como segredo da função. A chave deve permitir acesso ao gateway de IA da Lovable.

Na configuração incluída, `supabase/config.toml` define `verify_jwt = false` para `coach-chat`. O navegador envia a chave publicável e o código da função não valida uma sessão do usuário. Quem alcançar o endpoint pode acionar o gateway na configuração atual. Restrinja o teste a um ambiente controlado com dados fictícios. Uma implantação pública precisa de autenticação na função e controle de acesso antes de encaminhar requisições à IA.

## Status e materiais

O código reúne os fluxos da aplicação, mas o pacote sozinho não permite recriar o banco em um Supabase vazio. A execução completa depende do esquema base e, para o coach, do gateway de IA.

- [Diagrama do ecossistema](Diagrama%20do%20Ecossistema.png)
- [Memorial de construção](memorial%20de%20constru%C3%A7%C3%A3o.txt)
- [Estrutura da pasta do projeto](Estrutura%20da%20Pasta%20do%20Projeto.txt)
