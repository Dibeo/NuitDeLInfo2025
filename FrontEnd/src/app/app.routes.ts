import { Routes } from '@angular/router';
import { MainVisualizer } from './component/VisualisationAudio/main-visualizer/main-visualizer'; 
import { PodiumComponent } from './pages/podium/podium.component';
import { Scene } from './components/Principal/scene/scene';

export const routes: Routes = [
    { path: 'podium', component : PodiumComponent },
    { path:'' , component : Scene },
    {path:"visualisation-audio", component : MainVisualizer}
];
