import React from 'react'
import { render, screen } from '@testing-library/react'
import { 
  TableSkeleton, 
  CardSkeleton, 
  FormSkeleton, 
  ListSkeleton, 
  StatsSkeleton,
  LoadingWithProgress,
  InfiniteLoading,
  ErrorLoading,
  EmptyState
} from '@/components/LoadingStates'

describe('LoadingStates Components', () => {
  describe('TableSkeleton', () => {
    it('deve renderizar skeleton de tabela com valores padrão', () => {
      render(<TableSkeleton />)
      
      // Verificar se o header está presente
      expect(screen.getByRole('table')).toBeInTheDocument()
      
      // Verificar se há 5 linhas (padrão)
      const rows = screen.getAllByRole('row')
      expect(rows).toHaveLength(6) // 1 header + 5 linhas
    })

    it('deve renderizar skeleton de tabela com valores customizados', () => {
      render(<TableSkeleton rows={3} columns={6} />)
      
      const rows = screen.getAllByRole('row')
      expect(rows).toHaveLength(4) // 1 header + 3 linhas
    })
  })

  describe('CardSkeleton', () => {
    it('deve renderizar skeleton de cards com valor padrão', () => {
      render(<CardSkeleton />)
      
      // Verificar se há 4 cards (padrão)
      const cards = document.querySelectorAll('.bg-white.rounded-lg.shadow.p-6')
      expect(cards).toHaveLength(4)
    })

    it('deve renderizar skeleton de cards com valor customizado', () => {
      render(<CardSkeleton cards={6} />)
      
      const cards = document.querySelectorAll('.bg-white.rounded-lg.shadow.p-6')
      expect(cards).toHaveLength(6)
    })
  })

  describe('FormSkeleton', () => {
    it('deve renderizar skeleton de formulário com valor padrão', () => {
      render(<FormSkeleton />)
      
      // Verificar se há 6 campos (padrão)
      const fields = document.querySelectorAll('.h-10.bg-gray-200.rounded.w-full')
      expect(fields).toHaveLength(6)
    })

    it('deve renderizar skeleton de formulário com valor customizado', () => {
      render(<FormSkeleton fields={8} />)
      
      const fields = document.querySelectorAll('.h-10.bg-gray-200.rounded.w-full')
      expect(fields).toHaveLength(8)
    })
  })

  describe('ListSkeleton', () => {
    it('deve renderizar skeleton de lista com valor padrão', () => {
      render(<ListSkeleton />)
      
      // Verificar se há 8 itens (padrão)
      const items = document.querySelectorAll('.bg-white.rounded-lg.p-4.shadow')
      expect(items).toHaveLength(8)
    })

    it('deve renderizar skeleton de lista com valor customizado', () => {
      render(<ListSkeleton items={5} />)
      
      const items = document.querySelectorAll('.bg-white.rounded-lg.p-4.shadow')
      expect(items).toHaveLength(5)
    })
  })

  describe('StatsSkeleton', () => {
    it('deve renderizar skeleton de estatísticas', () => {
      render(<StatsSkeleton />)
      
      // Verificar se há 4 cards de estatísticas
      const stats = document.querySelectorAll('.bg-white.rounded-lg.shadow.p-6')
      expect(stats).toHaveLength(4)
    })
  })

  describe('LoadingWithProgress', () => {
    it('deve renderizar loading com progresso', () => {
      render(<LoadingWithProgress progress={75} />)
      
      // Usar getAllByText para pegar todos os elementos com "Carregando..."
      const loadingElements = screen.getAllByText('Carregando...')
      expect(loadingElements.length).toBeGreaterThan(0)
      expect(screen.getByText('75%')).toBeInTheDocument()
    })

    it('deve renderizar loading com mensagem customizada', () => {
      render(<LoadingWithProgress progress={50} message="Processando dados..." />)
      
      expect(screen.getByText('Processando dados...')).toBeInTheDocument()
      expect(screen.getByText('50%')).toBeInTheDocument()
    })

    it('deve renderizar loading sem porcentagem', () => {
      render(<LoadingWithProgress progress={25} showPercentage={false} />)
      
      // Usar getAllByText para pegar todos os elementos com "Carregando..."
      const loadingElements = screen.getAllByText('Carregando...')
      expect(loadingElements.length).toBeGreaterThan(0)
      expect(screen.queryByText('25%')).not.toBeInTheDocument()
    })

    it('deve limitar progresso a 100%', () => {
      render(<LoadingWithProgress progress={150} />)
      
      // Verificar se o progresso foi limitado a 100%
      expect(screen.getByText('150%')).toBeInTheDocument()
      // Verificar se a barra de progresso está em 100%
      const progressBar = document.querySelector('.bg-blue-600.h-2.rounded-full')
      expect(progressBar).toHaveStyle('width: 100%')
    })
  })

  describe('InfiniteLoading', () => {
    it('deve renderizar loading infinito com mensagem padrão', () => {
      render(<InfiniteLoading />)
      
      expect(screen.getByText('Carregando mais itens...')).toBeInTheDocument()
    })

    it('deve renderizar loading infinito com mensagem customizada', () => {
      render(<InfiniteLoading message="Buscando produtos..." />)
      
      expect(screen.getByText('Buscando produtos...')).toBeInTheDocument()
    })

    it('deve renderizar os três pontos animados', () => {
      render(<InfiniteLoading />)
      
      const dots = document.querySelectorAll('.w-4.h-4.bg-blue-600.rounded-full.animate-bounce')
      expect(dots).toHaveLength(3)
    })
  })

  describe('ErrorLoading', () => {
    it('deve renderizar loading de erro com mensagem', () => {
      render(<ErrorLoading error="Falha na conexão" />)
      
      expect(screen.getByText('Erro ao carregar')).toBeInTheDocument()
      expect(screen.getByText('Falha na conexão')).toBeInTheDocument()
    })

    it('deve renderizar botão de retry quando onRetry for fornecido', () => {
      const mockRetry = jest.fn()
      render(<ErrorLoading error="Erro de rede" onRetry={mockRetry} />)
      
      const retryButton = screen.getByText('Tentar novamente')
      expect(retryButton).toBeInTheDocument()
      
      retryButton.click()
      expect(mockRetry).toHaveBeenCalledTimes(1)
    })

    it('não deve renderizar botão de retry quando onRetry não for fornecido', () => {
      render(<ErrorLoading error="Erro de validação" />)
      
      expect(screen.queryByText('Tentar novamente')).not.toBeInTheDocument()
    })
  })

  describe('EmptyState', () => {
    it('deve renderizar estado vazio com título e mensagem', () => {
      render(
        <EmptyState 
          title="Nenhum produto encontrado" 
          message="Não há produtos cadastrados nesta categoria"
        />
      )
      
      expect(screen.getByText('Nenhum produto encontrado')).toBeInTheDocument()
      expect(screen.getByText('Não há produtos cadastrados nesta categoria')).toBeInTheDocument()
    })

    it('deve renderizar ação quando fornecida', () => {
      const action = <button>Adicionar Produto</button>
      render(
        <EmptyState 
          title="Lista vazia" 
          message="Comece adicionando um item"
          action={action}
        />
      )
      
      expect(screen.getByText('Adicionar Produto')).toBeInTheDocument()
    })

    it('não deve renderizar ação quando não fornecida', () => {
      render(
        <EmptyState 
          title="Lista vazia" 
          message="Nenhum item encontrado"
        />
      )
      
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })
  })

  describe('Animações e Estilos', () => {
    it('deve aplicar classes de animação pulse', () => {
      render(<TableSkeleton />)
      
      const pulseElement = document.querySelector('.animate-pulse')
      expect(pulseElement).toBeInTheDocument()
    })

    it('deve aplicar classes de animação bounce', () => {
      render(<InfiniteLoading />)
      
      const bounceElements = document.querySelectorAll('.animate-bounce')
      expect(bounceElements.length).toBeGreaterThan(0)
    })

    it('deve aplicar transições CSS', () => {
      render(<LoadingWithProgress progress={50} />)
      
      const progressBar = document.querySelector('.transition-all.duration-300.ease-out')
      expect(progressBar).toBeInTheDocument()
    })
  })

  describe('Responsividade', () => {
    it('deve aplicar classes responsivas para grid', () => {
      render(<CardSkeleton />)
      
      const gridElement = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4')
      expect(gridElement).toBeInTheDocument()
    })

    it('deve aplicar classes responsivas para tabelas', () => {
      render(<TableSkeleton />)
      
      const tableElement = document.querySelector('.min-w-full')
      expect(tableElement).toBeInTheDocument()
    })
  })

  describe('Acessibilidade', () => {
    it('deve ter estrutura semântica adequada', () => {
      render(<TableSkeleton />)
      
      expect(screen.getByRole('table')).toBeInTheDocument()
      // Verificar se há elementos thead e tbody
      expect(document.querySelector('thead')).toBeInTheDocument()
      expect(document.querySelector('tbody')).toBeInTheDocument()
    })

    it('deve ter botões clicáveis quando apropriado', () => {
      const mockRetry = jest.fn()
      render(<ErrorLoading error="Erro" onRetry={mockRetry} />)
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      // Verificar se o botão é clicável
      expect(button).toBeEnabled()
    })
  })
}) 