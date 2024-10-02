import { Component, inject, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';

import { NgIf, NgFor, CurrencyPipe } from '@angular/common';
import { Product } from '../product';
import { ProductService } from '../product.service';
import { catchError, EMPTY, Subscription, tap } from 'rxjs';

@Component({
    selector: 'pm-product-detail',
    templateUrl: './product-detail.component.html',
    standalone: true,
    imports: [NgIf, NgFor, CurrencyPipe]
})
export class ProductDetailComponent implements OnChanges, OnDestroy {

  @Input() productId: number = 0;
  errorMessage = '';
  productService = inject(ProductService);
  sub! : Subscription;

  // Product to display
  product: Product | null = null;

  // Set the page title
  pageTitle = this.product ? `Product Detail for: ${this.product.productName}` : 'Product Detail';

  ngOnChanges(changes: SimpleChanges): void {
    const id = changes['productId'].currentValue;
    if (id){
        this.sub = this.productService
          .getProduct(id)
          .pipe(tap(
            () => console.log('Getting product from component')),
            catchError(err => { 
              this.errorMessage = err;
              return EMPTY;
            })
          )
          .subscribe(
            product => this.product = product
          );
    }
  }  

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
  
  addToCart(product: Product) {
  }
}
