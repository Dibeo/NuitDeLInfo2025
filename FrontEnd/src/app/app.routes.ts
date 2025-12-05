import { Routes } from '@angular/router';
import { PodiumComponent } from './pages/podium/podium.component';
import { Scene } from './components/Principal/scene/scene';

export const routes: Routes = [
    { path: 'podium', component : PodiumComponent },
    { path:'' , component : Scene }
];
