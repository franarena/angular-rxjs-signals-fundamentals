import { computed, effect, Injectable, signal } from "@angular/core";
import { CartItem } from "./cart";
import { Product } from "../products/product";

@Injectable({
  providedIn: 'root'
})

export class CartService {
  private readonly taxFee: number = 0.1075;
  cartItems = signal<CartItem[]>([]);
  cartCount = computed(() => this.cartItems()
    .reduce((accQty, item) => accQty + item.quantity, 0)
  );

  subTotal = computed(() => this.cartItems()
    .reduce((accPrice, item) => accPrice + (item.quantity * item.product.price), 0)
  );

  deliveryFee = computed<number>(() => this.subTotal() < 50 ? 5.99 : 0);

  tax = computed(() => Math.round(this.subTotal() * this.taxFee));

  totalPrice = computed(() => this.subTotal() + this.deliveryFee() + this.tax());

  eLength = effect(() => console.log('Cart array length: ', this.cartItems().length));

  addToCart(product: Product): void {
    //this.cartItems().push({ product, quantity: 1});
    this.cartItems.update(items => [...items, { product, quantity: 1}]);
  }

  removeFromCart(cartItem: CartItem): void {
    this.cartItems.update(items =>
      items.filter(item => item.product.id !== cartItem.product.id)
    );
  }

  updateQuantity(cartItem: CartItem, quantity: number): void {
    this.cartItems.update(items => 
      items.map(item => item.product.id === cartItem.product.id ? 
        { ...item, quantity } : item ));
  }
}
