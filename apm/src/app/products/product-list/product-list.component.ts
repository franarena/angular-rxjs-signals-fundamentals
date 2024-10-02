import { Component, inject, OnDestroy, OnInit } from '@angular/core';

import { NgIf, NgFor, NgClass, AsyncPipe } from '@angular/common';
import { Product } from '../product';
import { ProductDetailComponent } from '../product-detail/product-detail.component';
import { ProductService } from '../product.service';
import { catchError, EMPTY, tap } from 'rxjs';

@Component({
    selector: 'pm-product-list',
    templateUrl: './product-list.component.html',
    standalone: true,
  imports: [NgIf, NgFor, NgClass, ProductDetailComponent, AsyncPipe]
})
export class ProductListComponent {

  pageTitle = 'Products';
  errorMessage = '';

  private productService = inject(ProductService);

  readonly products$ = this.productService.products$
        .pipe(
          catchError((err) => {
            this.errorMessage = err;
            return EMPTY;
        }));
        

  // Selected product id to highlight the entry
  readonly selectedProductId$ = this.productService.productSelectedSubject$;

  onSelected(productId: number): void {
    //this.selectedProductId = productId;
    this.productService.productSelected(productId);
  }
}
