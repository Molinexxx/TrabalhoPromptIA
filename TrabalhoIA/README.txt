BOSSFIT AI 🏋️‍♂️🤖
Transformando dados em performance. Um ecossistema inteligente de gestão de treinos focado em consistência, feedback visual e acessibilidade.

O BOSSFIT AI é uma aplicação web moderna projetada para monitorar, instruir e gamificar a rotina de exercícios físicos do usuário. Construído com foco em performance extrema e design de interface (UI) premium utilizando o padrão Glassmorphism e Glow Design.

-- Principais Funcionalidades
Heatmap de Consistência (WorkoutHeatmap): Acompanhamento visual de treinos baseado em grade (inspirado no GitHub de contribuições). Suporta até 12 semanas de histórico cronológico com mapeamento dinâmico de cores por volume.

Smart Media Center (ExerciseImage & VideoModal): * Imagens de exercícios com lazy loading, decodificação assíncrona (decoding="async") e sistema de fallback automático caso a mídia principal falhe.

Player de vídeo integrado via API do YouTube em modais de alta performance, sem retenção de memória após o fechamento.

Dashboard Analítico: Gráficos interativos (via Recharts) com Tooltips e Legends customizadas que se adaptam automaticamente ao tema (Light/Dark).

Interface Acessível (a11y): Utilização massiva de primitivas do Radix UI (Shadcn/UI), garantindo navegação por teclado, suporte a leitores de tela e interações fluidas (Drawers, Dialogs, Popovers).

-- Tecnologias e Arquitetura
O projeto utiliza uma stack moderna para garantir tipagem estática, componentização inteligente e estilização utilitária:

Core: React 18+ com TypeScript.

Estilização: Tailwind CSS combinado com class-variance-authority (cva) e clsx/tailwind-merge (lib/utils.ts) para controle dinâmico de classes.

Biblioteca de UI: Radix UI (Shadcn UI Base) cobrindo componentes complexos como Calendários (react-day-picker), Carrosseis (embla-carousel-react) e Formulários (react-hook-form).

Ícones: Lucide React.

Gráficos: Recharts Primitive.

-- Estrutura do Projeto
A organização de pastas segue o princípio de separação de responsabilidades, isolando componentes de UI genéricos das lógicas de negócio específicas do treino.

Plaintext

src/
├── components/                 # Componentes de Domínio (Business Logic)
│   ├── ExerciseImage.tsx       # Renderizador de imagens com fallback
│   ├── VideoModal.tsx          # Modal de visualização técnica (YouTube)
│   └── WorkoutHeatmap.tsx      # Engine do gráfico de consistência
├── components/ui/              # Design System / Componentes Genéricos (Shadcn)
│   ├── accordion.tsx, button.tsx, card.tsx, dialog.tsx...
│   ├── chart.tsx               # Wrapper avançado para o Recharts
│   └── form.tsx                # Contextos de formulário e validação
├── lib/                        # Utilitários, Tipagens e Configurações
│   ├── types.ts                # Interfaces globais (Day, Exercise, etc.)
│   └── utils.ts                # Funções de merge de classes (cn)
-- Como Executar o Projeto Localmente
Siga os passos abaixo para rodar a aplicação em seu ambiente de desenvolvimento.

Pré-requisitos
Node.js (versão 18.x ou superior recomendada)

Um gerenciador de pacotes (npm, yarn, pnpm ou bun)

  Instalação
Clone este repositório:

Bash

git clone https://github.com/seu-usuario/bossfit-ai.git
Acesse o diretório do projeto:

Bash

cd bossfit-ai
Instale as dependências. Note que o projeto utiliza diversas bibliotecas focadas em UI/UX:

Bash

npm install
# Instalará dependências como radix-ui, embla-carousel, recharts, date-fns, etc.
Inicie o servidor de desenvolvimento:

Bash

npm run dev
Abra o navegador em http://localhost:5173 (ou a porta indicada no terminal).


-- Notas de Design (Design System)
O BOSSFIT AI implementa um sistema robusto de temas utilizando variáveis CSS nativas gerenciadas pelo Tailwind:

Cores Semânticas: Variáveis como --primary, --destructive e --muted controlam o ecossistema.

Glow & Translucidez: Componentes vitais (como dias de alta performance no Heatmap) utilizam a classe customizada shadow-glow atrelada à cor principal.

-- Avisos de Redução de Carga (Sobre Mídias)
Nota para os Avaliadores/Devs: Para manter este repositório leve e ágil, imagens em altíssima resolução e vídeos brutos não estão incluídos no controle de versão.

Vídeos são consumidos sob demanda via iframe (YouTube).

O componente ExerciseImage.tsx está configurado para tratar imagens ausentes graciosamente, injetando um EXERCISE_PLACEHOLDER padrão. Isso não compromete a experiência e entendimento do fluxo do software.