import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, catchError, combineLatest, filter, map, Observable, of, shareReplay, switchMap, tap, throwError } from 'rxjs';
import { Product } from './product';
import { ProductData } from './product-data';
import { HttpErrorService } from '../utilities/http-error.service';
import { ReviewService } from '../reviews/review.service';
import { Review } from '../reviews/review';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsUrl = 'api/products';
  private http = inject(HttpClient);
  private errorService = inject(HttpErrorService);
  private reviewService = inject(ReviewService);

  private productSelectedSubject = new BehaviorSubject<number | undefined>(undefined);
  readonly productSelectedSubject$ = this.productSelectedSubject.asObservable();

  readonly products$ = this.http.get<Product[]>(this.productsUrl)
  .pipe(
    tap(p => console.log(JSON.stringify(p))),
    shareReplay(1),
    catchError(err => this.handleError(err))
  );


/*
  constructor (private http: HttpClient){

  }


  getProducts(): Observable<Product[]>{
    return this.http.get<Product[]>(this.productsUrl)
    .pipe(
      tap(() => console.log('In http.get pipeline')),
      catchError(err => this.handleError(err))
      // catchError(err => { 
      //   console.error(err); 
      //   return of(ProductData.products);
      // })
    );
  }
  */

  readonly product1$ = this.productSelectedSubject$
  .pipe(
    filter(Boolean),
    switchMap(id => {
      const productUrl = this.productsUrl + '/' + id;
      return this.http.get<Product>(productUrl)
        .pipe(
          switchMap(product => this.getProductWithReviews(product)),
          catchError(err => this.handleError(err))
      );
    })
  );

  product$ = combineLatest([
    this.productSelectedSubject$,
    this.products$
  ])
  .pipe(
    map(([selectedProductId, products]) => products.find(p => p.id === selectedProductId)),
    filter(Boolean),
    switchMap(product => this.getProductWithReviews(product)),
    catchError(err => this.handleError(err))    
  );

  productSelected(selectedProductId: number) {
    this.productSelectedSubject.next(selectedProductId);
  }

  private getProductWithReviews(product: Product): Observable<Product>{
    if (product.hasReviews){
      return this.http.get<Review[]>(this.reviewService.getReviewUrl(product.id))
      .pipe(
        map(reviews => ({ ...product, reviews} as Product))
      )    
    }
    else {
      return of(product);
    }
  }

  private handleError(err: HttpErrorResponse) : Observable<never>{
    const formmattedMessage = this.errorService.formatError(err);
    return throwError(() => formmattedMessage);
  }
}
