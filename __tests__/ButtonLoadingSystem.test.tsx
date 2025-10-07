import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Button } from '@/components/ui/button';
import { useAsyncAction, useLoadingState } from '@/hooks/useAsyncAction';

// Componente de teste para demonstrar o uso dos hooks
function TestComponent() {
  const { isLoading: isSaving, execute: saveData } = useAsyncAction({
    onSuccess: () => console.log('Sucesso!'),
    onError: (error) => console.error('Erro:', error),
  });

  const { isLoading: isDeleting, execute: deleteData } = useLoadingState();

  const handleSave = async () => {
    await saveData(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      return { success: true };
    });
  };

  const handleDelete = async () => {
    await deleteData(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });
  };

  const handleSyncAction = () => {
    console.log('Ação síncrona');
  };

  return (
    <div>
      <Button 
        data-testid="save-button"
        onClick={handleSave}
        loadingText="Salvando..."
      >
        Salvar
      </Button>
      
      <Button 
        data-testid="delete-button"
        onClick={handleDelete}
        loading={isDeleting}
        loadingText="Deletando..."
      >
        Deletar
      </Button>
      
      <Button 
        data-testid="sync-button"
        onClick={handleSyncAction}
      >
        Ação Síncrona
      </Button>
      
      <Button 
        data-testid="disabled-button"
        disabled
      >
        Desabilitado
      </Button>
    </div>
  );
}

describe('Button com Prevenção de Cliques Duplos e Loading', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('deve exibir loading durante ação assíncrona', async () => {
    render(<TestComponent />);
    
    const saveButton = screen.getByTestId('save-button');
    
    // Clique no botão
    fireEvent.click(saveButton);
    
    // Aguarda o loading aparecer
    await waitFor(() => {
      expect(saveButton).toHaveTextContent('Salvando...');
      expect(saveButton).toBeDisabled();
    });
    
    // Aguarda a conclusão da ação
    await waitFor(() => {
      expect(saveButton).not.toBeDisabled();
      expect(saveButton).toHaveTextContent('Salvar');
    }, { timeout: 1000 });
  });

  test('deve prevenir cliques duplos', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    render(<TestComponent />);
    
    const saveButton = screen.getByTestId('save-button');
    
    // Múltiplos cliques rápidos
    fireEvent.click(saveButton);
    fireEvent.click(saveButton);
    fireEvent.click(saveButton);
    
    // Aguarda a conclusão
    await waitFor(() => {
      expect(saveButton).not.toBeDisabled();
    }, { timeout: 1000 });
    
    // Verifica se a ação foi executada apenas uma vez
    expect(consoleSpy).toHaveBeenCalledTimes(1);
    
    consoleSpy.mockRestore();
  });

  test('deve funcionar com loading controlado externamente', async () => {
    render(<TestComponent />);
    
    const deleteButton = screen.getByTestId('delete-button');
    
    // Clique no botão
    fireEvent.click(deleteButton);
    
    // Aguarda o loading aparecer
    await waitFor(() => {
      expect(deleteButton).toHaveTextContent('Deletando...');
      expect(deleteButton).toBeDisabled();
    });
    
    // Aguarda a conclusão
    await waitFor(() => {
      expect(deleteButton).not.toBeDisabled();
      expect(deleteButton).toHaveTextContent('Deletar');
    }, { timeout: 1000 });
  });

  test('deve executar ação síncrona sem loading', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    render(<TestComponent />);
    
    const syncButton = screen.getByTestId('sync-button');
    
    // Clique no botão
    fireEvent.click(syncButton);
    
    // Verifica se a ação foi executada imediatamente
    expect(consoleSpy).toHaveBeenCalledWith('Ação síncrona');
    expect(syncButton).not.toBeDisabled();
    
    consoleSpy.mockRestore();
  });

  test('deve manter botão desabilitado quando disabled=true', () => {
    render(<TestComponent />);
    
    const disabledButton = screen.getByTestId('disabled-button');
    
    // Verifica se o botão está desabilitado
    expect(disabledButton).toBeDisabled();
    
    // Clique não deve executar ação
    fireEvent.click(disabledButton);
    expect(disabledButton).toBeDisabled();
  });

  test('deve tratar erros corretamente', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    function ErrorTestComponent() {
      const { isLoading, execute } = useAsyncAction({
        onError: (error) => console.error('Erro capturado:', error),
      });

  const handleError = async () => {
    await execute(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      throw new Error('Erro simulado');
    });
  };

      return (
        <Button 
          data-testid="error-button"
          onClick={handleError}
          loading={isLoading}
          loadingText="Processando..."
        >
          Teste de Erro
        </Button>
      );
    }

    render(<ErrorTestComponent />);
    
    const errorButton = screen.getByTestId('error-button');
    
    // Clique no botão
    fireEvent.click(errorButton);
    
    // Aguarda o loading aparecer
    await waitFor(() => {
      expect(errorButton).toHaveTextContent('Processando...');
      expect(errorButton).toBeDisabled();
    });
    
    // Aguarda o erro e verifica se o botão é reabilitado
    await waitFor(() => {
      expect(errorButton).not.toBeDisabled();
      expect(errorButton).toHaveTextContent('Teste de Erro');
    }, { timeout: 1000 });
    
    // Verifica se o erro foi tratado
    expect(consoleSpy).toHaveBeenCalledWith('Erro capturado:', expect.any(Error));
    
    consoleSpy.mockRestore();
  });
});