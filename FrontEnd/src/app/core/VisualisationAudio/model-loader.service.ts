import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class ModelLoaderService {

  static loadTextures(texturePaths: string[]): Promise<THREE.Texture[]> {
    const loader = new THREE.TextureLoader();
    const promises = texturePaths.map(
      (path) =>
        new Promise<THREE.Texture>((resolve, reject) => {
          loader.load(
            path,
            (texture) => resolve(texture),
            undefined,
            (err) => {
              console.warn(`Texture failed to load from ${path}. Using fallback material.`);
              reject(err);
            }
          );
        })
    );
    return Promise.all(promises);
  }

  static applyTexturesToGLTF(gltf: THREE.Group, textures: THREE.Texture[]): THREE.Group {
    let textureIndex = 0;

    gltf.traverse((child: THREE.Object3D) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const material = (mesh.material as THREE.Material)
          ? (mesh.material as THREE.MeshStandardMaterial).clone()
          : new THREE.MeshStandardMaterial();

        material.map = textures[textureIndex % textures.length];
        material.metalness = 0.8;
        material.roughness = 0.5;

        mesh.material = material;
        textureIndex++;
      }
    });

    return gltf;
  }

  static async loadGLTFModel(
    path: string,
    texturePaths: string[] = [],
    scale: number = 1
  ): Promise<THREE.Group> {
    if (typeof GLTFLoader === 'undefined') {
      return Promise.reject('GLTFLoader not available in the current THREE.js distribution.');
    }

    const textures = await this.loadTextures(texturePaths).catch((err) => {
      console.warn('Failed to load textures:', err);
      return [];
    });

    const loader = new GLTFLoader();

    return new Promise((resolve, reject) => {
      loader.load(
        path,
        (gltf) => {
          const scene = gltf.scene;
          scene.scale.set(scale, scale, scale);

          if (textures.length > 0) {
            this.applyTexturesToGLTF(scene, textures);
          }

          resolve(scene);
        },
        (xhr: ProgressEvent) => {
          const percent = xhr.total ? (xhr.loaded / xhr.total) * 100 : 0;
          console.log(`GLTFLoader: ${percent.toFixed(2)}% loaded`);
        },
        (error: any) => {
          console.error('Error loading GLTF file:', error);
          reject(error);
        }
      );
    });
  }
}
