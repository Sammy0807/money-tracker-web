import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { NgFor, NgIf, CurrencyPipe, DatePipe } from '@angular/common';
import { TransactionsApi } from '../../core/api/transactions.api';

@Component({
  standalone: true,
  selector: 'app-transactions',
  imports: [NgFor, NgIf, CurrencyPipe, DatePipe],
  templateUrl: 'transactions.page.html',
  styleUrls: ['transactions.page.scss']
})
export default class TransactionsPage implements OnInit, OnDestroy {
  api = inject(TransactionsApi);
  sub?: any;
  ngOnInit(){ this.sub = this.api.list(); }
  ngOnDestroy(){ this.sub?.unsubscribe(); }
  refresh(){ this.sub?.unsubscribe(); this.sub = this.api.list(); }
}
