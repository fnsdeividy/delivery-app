# Regras Específicas para React e TypeScript

## Componentes React

### Estrutura de Componente
```tsx
// ✅ Correto
interface Props {
  title: string;
  isVisible?: boolean;
  onClose: () => void;
}

export function MyComponent({ title, isVisible = false, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">{title}</h1>
      {isVisible && <button onClick={onClose}>Close</button>}
    </div>
  );
}
```

### Hooks Customizados
```tsx
// ✅ Correto
export function useStoreData(storeSlug: string) {
  const [data, setData] = useState<StoreConfig | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchStore() {
      try {
        const response = await fetch(`/api/stores/${storeSlug}/config`);
        const storeData = await response.json();
        setData(storeData);
      } catch (error) {
        console.error('Erro ao carregar loja:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchStore();
  }, [storeSlug]);
  
  return { data, loading };
}
```

## TypeScript Patterns

### Definição de Tipos
```tsx
// ✅ Correto - Interface para props
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

// ✅ Correto - Type para union types
type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered';

// ✅ Correto - Utility types
type CreateOrderPayload = Omit<Order, 'id' | 'createdAt' | 'updatedAt'>;
```

### Event Handlers
```tsx
// ✅ Correto
function OrderForm() {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Handle form submission
  };
  
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input onChange={handleInputChange} />
    </form>
  );
}
```

## Error Handling

### Try-Catch com TypeScript
```tsx
// ✅ Correto
async function createOrder(orderData: CreateOrderPayload): Promise<Order | null> {
  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    return null;
  }
}
```

### Error Boundaries
```tsx
// ✅ Correto
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }
  
  render() {
    if (this.state.hasError) {
      return <div>Algo deu errado: {this.state.error?.message}</div>;
    }
    
    return this.props.children;
  }
}
```

## Performance Optimization

### React.memo com TypeScript
```tsx
// ✅ Correto
interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: string) => void;
}

export const ProductCard = React.memo<ProductCardProps>(({ 
  product, 
  onAddToCart 
}) => {
  return (
    <div className="border rounded-lg p-4">
      <h3 className="font-bold">{product.name}</h3>
      <p className="text-gray-600">{product.description}</p>
      <button onClick={() => onAddToCart(product.id)}>
        Adicionar ao Carrinho
      </button>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';
```

### useCallback e useMemo
```tsx
// ✅ Correto
function OrderList({ orders }: { orders: Order[] }) {
  const filteredOrders = useMemo(() => 
    orders.filter(order => order.status !== 'cancelled'),
    [orders]
  );
  
  const handleOrderClick = useCallback((orderId: string) => {
    // Navigate to order detail
  }, []);
  
  return (
    <div>
      {filteredOrders.map(order => (
        <OrderItem 
          key={order.id} 
          order={order} 
          onClick={handleOrderClick}
        />
      ))}
    </div>
  );
}
```

## Context e State Management

### Context com TypeScript
```tsx
// ✅ Correto
interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}
```

## API Routes (Next.js)

### Request/Response Types
```tsx
// ✅ Correto
interface CreateStoreRequest {
  name: string;
  slug: string;
  config: StoreConfig;
}

interface CreateStoreResponse {
  success: boolean;
  store?: Store;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateStoreRequest = await request.json();
    
    // Validate input
    if (!body.name || !body.slug) {
      return NextResponse.json(
        { success: false, error: 'Nome e slug são obrigatórios' },
        { status: 400 }
      );
    }
    
    // Create store logic here
    const store = await createStore(body);
    
    return NextResponse.json(
      { success: true, store },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
```

## Prisma Integration

### Type-safe Database Operations
```tsx
// ✅ Correto
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface GetOrdersParams {
  storeSlug: string;
  status?: OrderStatus;
  limit?: number;
}

export async function getOrders({ 
  storeSlug, 
  status, 
  limit = 10 
}: GetOrdersParams) {
  return await prisma.order.findMany({
    where: {
      store: { slug: storeSlug },
      ...(status && { status }),
    },
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        include: { product: true }
      },
      customer: true,
    },
  });
}
```

## Testing Patterns

### Component Testing
```tsx
// ✅ Correto
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductCard } from './ProductCard';

const mockProduct: Product = {
  id: '1',
  name: 'Test Product',
  description: 'Test Description',
  price: 10.99,
  // ... other properties
};

describe('ProductCard', () => {
  it('should render product information', () => {
    const mockAddToCart = jest.fn();
    
    render(
      <ProductCard 
        product={mockProduct} 
        onAddToCart={mockAddToCart} 
      />
    );
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });
  
  it('should call onAddToCart when button is clicked', () => {
    const mockAddToCart = jest.fn();
    
    render(
      <ProductCard 
        product={mockProduct} 
        onAddToCart={mockAddToCart} 
      />
    );
    
    fireEvent.click(screen.getByText('Adicionar ao Carrinho'));
    expect(mockAddToCart).toHaveBeenCalledWith('1');
  });
});
```