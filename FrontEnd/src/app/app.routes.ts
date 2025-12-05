import { Routes } from '@angular/router';
import { MainVisualizer } from './component/VisualisationAudio/main-visualizer/main-visualizer'; 
import { PodiumComponent } from './pages/podium/podium.component';
import { Scene } from './component/Principal/scene/scene';
import { PodiumThreeDimension } from './pages/podium-three-dimension/podium-three-dimension';

export const routes: Routes = [
  { path: 'podium', component: PodiumComponent },
  { path: 'podium3d', component: PodiumThreeDimension },
  { path: 'principal', component: Scene },
  { path: 'podium', component : PodiumComponent },
  { path: 'visualisation-audio', component : MainVisualizer }
  { path: '' , component : Scene }
];
