import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const storagedProducts = await AsyncStorage.getItem(
        '@GoMarketplace:products',
      );

      if (storagedProducts) {
        setProducts([...JSON.parse(storagedProducts)]);
      }
    }

    loadProducts();
  }, []);

  useEffect(() => {
    async function updateProducts(): Promise<void> {
      // TODO UPDATE ITEMS FROM ASYNC STORAGE
      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(products),
      );
    }
    updateProducts();
  }, [products]);

  const addToCart = useCallback(
    async product => {
      // TODO ADD A NEW ITEM TO THE CART
      const productsExist = products.find(p => p.id === product.id);

      if (productsExist) {
        setProducts(
          products.map(p =>
            p.id === product.id ? { ...product, quantity: p.quantity + 1 } : p,
          ),
        );
      } else {
        setProducts([...products, { ...product, quantity: 1 }]);
      }

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const newProducts = products.map(product =>
        product.id === id
          ? { ...product, quantity: product.quantity + 1 }
          : product,
      );

      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      setProducts(newProducts);

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(newProducts),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      //     const newProducts = products.map(product =>
      //       product.id === id
      //         ? { ...product, quantity: product.quantity - 1 }
      //         : product,
      //     );
      //     // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      //     setProducts(newProducts);

      //     await AsyncStorage.setItem(
      //       '@GoMarketplace:products',
      //       JSON.stringify(newProducts),
      //     );
      //   },
      //   [products],
      // );
      const productFinded = products.find(product => product.id === id);
      if (productFinded?.quantity === 1) {
        const productsUpdated = products.filter(product => product.id !== id);
        setProducts(productsUpdated);
        await AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify(productsUpdated),
        );
      } else {
        const productsUpdated = products.map(product => {
          if (product.id === id) {
            product.quantity -= 1;
          }
          return product;
        });
        setProducts(productsUpdated);
        await AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify(productsUpdated),
        );
      }
    },
    [products],
  );
  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
