import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { WordCardComponent } from './components/word-card/word-card.component';
import { NullableValuePipe } from './pipes/nullableValue.pipe';
import { ReactiveFormsModule } from '@angular/forms';
import { GameService } from './services/game.service';
import { CommonModule } from '@angular/common';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { WordSelectComponent } from './components/word-select/word-select.component';

@NgModule({ declarations: [
        AppComponent,
        NullableValuePipe
    ],
    bootstrap: [AppComponent], imports: [BrowserModule,
        CommonModule,
        ReactiveFormsModule,
        AppRoutingModule,
        WordCardComponent,
        WordSelectComponent], providers: [
        GameService,
        provideHttpClient(withInterceptorsFromDi())
    ] })
export class AppModule { }
