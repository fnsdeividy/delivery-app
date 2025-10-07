import React from 'react';
import { Button } from '@/components/ui/button';
import { useAsyncAction, useLoadingState } from '@/hooks/useAsyncAction';

/**
 * Componente de exemplo demonstrando o uso do Button com prevenção de cliques duplos
 * e estado de loading
 */
export function ButtonExamples() {
  // Exemplo 1: Usando o hook useAsyncAction para controle completo
  const { isLoading: isSaving, execute: saveData } = useAsyncAction({
    onSuccess: () => console.log('Dados salvos com sucesso!'),
    onError: (error) => console.error('Erro ao salvar:', error),
  });

  // Exemplo 2: Usando o hook useLoadingState para controle simples
  const { isLoading: isDeleting, execute: deleteData } = useLoadingState();

  // Exemplo 3: Simulando navegação com delay
  const { isLoading: isNavigating, execute: navigate } = useAsyncAction({
    onSuccess: () => console.log('Navegação concluída!'),
  });

  // Simular ação de salvar dados
  const handleSave = () => {
    saveData(async () => {
      // Simular requisição de API
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { success: true };
    });
  };

  // Simular ação de deletar
  const handleDelete = () => {
    deleteData(async () => {
      // Simular requisição de API
      await new Promise(resolve => setTimeout(resolve, 1500));
    });
  };

  // Simular navegação
  const handleNavigate = () => {
    navigate(async () => {
      // Simular navegação com delay
      await new Promise(resolve => setTimeout(resolve, 1000));
    });
  };

  // Simular ação síncrona (sem Promise)
  const handleSyncAction = () => {
    console.log('Ação síncrona executada!');
  };

  // Simular ação que pode falhar
  const handleFailingAction = () => {
    saveData(async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      throw new Error('Erro simulado para teste');
    });
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold mb-4">Exemplos de Botões com Loading</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Botão com loading automático para Promise */}
        <Button 
          onClick={handleSave}
          loadingText="Salvando..."
          variant="default"
        >
          Salvar Dados
        </Button>

        {/* Botão com loading controlado externamente */}
        <Button 
          onClick={handleDelete}
          loading={isDeleting}
          loadingText="Deletando..."
          variant="destructive"
        >
          Deletar Item
        </Button>

        {/* Botão de navegação */}
        <Button 
          onClick={handleNavigate}
          loadingText="Navegando..."
          variant="gradient"
        >
          Ir para Página
        </Button>

        {/* Botão síncrono (sem loading) */}
        <Button 
          onClick={handleSyncAction}
          variant="outline"
        >
          Ação Síncrona
        </Button>

        {/* Botão que pode falhar */}
        <Button 
          onClick={handleFailingAction}
          loadingText="Processando..."
          variant="secondary"
        >
          Ação com Erro
        </Button>

        {/* Botão desabilitado */}
        <Button 
          disabled
          variant="ghost"
        >
          Botão Desabilitado
        </Button>

        {/* Botão com prevenção de cliques duplos desabilitada */}
        <Button 
          onClick={handleSave}
          preventDoubleClick={false}
          variant="purple"
        >
          Sem Prevenção de Duplo Clique
        </Button>
      </div>

      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold mb-2">Instruções de Teste:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Clique rapidamente nos botões para testar a prevenção de cliques duplos</li>
          <li>Observe o spinner e texto de loading durante as ações assíncronas</li>
          <li>Teste com rede lenta simulada (os delays são de 1-2 segundos)</li>
          <li>Teste o botão "Ação com Erro" para ver o tratamento de erros</li>
          <li>Compare o comportamento com e sem prevenção de cliques duplos</li>
        </ul>
      </div>
    </div>
  );
}