import { Routes } from '@angular/router';
import { PodiumComponent } from './pages/podium/podium.component';
import { Scene } from './component/Principal/scene/scene';
import { PodiumThreeDimension } from './pages/podium-three-dimension/podium-three-dimension';

export const routes: Routes = [
  { path: 'podium', component: PodiumComponent },
  { path: 'podium3d', component: PodiumThreeDimension },
  { path: 'principal', component: Scene },
];
