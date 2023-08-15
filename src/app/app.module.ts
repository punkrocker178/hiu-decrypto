import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { WordCardComponent } from './components/word-card/word-card.component';
import { NullableValuePipe } from './pipes/nullableValue.pipe';

@NgModule({
  declarations: [
    AppComponent,
    NullableValuePipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    WordCardComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
