'use client';

import React, { useMemo, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { usePlateStore } from '@/store/usePlateStore';

// Helper function to eliminate the radial lighting seam by welding normals where theta=0 meets theta=2PI
function weldLatheSeamNormals(geometry: THREE.BufferGeometry, segments: number, pointsCount: number) {
  geometry.computeVertexNormals();

  const normals = geometry.attributes.normal;
  if (!normals) return;

  // 1. Harmonize normals at the cylindrical seam (where column 0 meets column 'segments')
  for (let j = 0; j < pointsCount; j++) {
    const idx0 = j;
    const idxEnd = segments * pointsCount + j;

    const nx = normals.getX(idx0) + normals.getX(idxEnd);
    const ny = normals.getY(idx0) + normals.getY(idxEnd);
    const nz = normals.getZ(idx0) + normals.getZ(idxEnd);

    const len = Math.hypot(nx, ny, nz) || 1;
    normals.setXYZ(idx0, nx / len, ny / len, nz / len);
    normals.setXYZ(idxEnd, nx / len, ny / len, nz / len);
  }

  // 2. Harmonize center pole vertex at basin floor (row j = 0) so there is zero pinching
  let topNx = 0, topNy = 0, topNz = 0;
  for (let c = 0; c <= segments; c++) {
    const idx = c * pointsCount + 0;
    topNx += normals.getX(idx);
    topNy += normals.getY(idx);
    topNz += normals.getZ(idx);
  }
  const topLen = Math.hypot(topNx, topNy, topNz) || 1;
  const topUx = topNx / topLen;
  const topUy = topNy / topLen;
  const topUz = topNz / topLen;
  for (let c = 0; c <= segments; c++) {
    normals.setXYZ(c * pointsCount + 0, topUx, topUy, topUz);
  }

  // 3. Harmonize bottom center pole vertex (row j = pointsCount - 1)
  const lastRow = pointsCount - 1;
  let botNx = 0, botNy = 0, botNz = 0;
  for (let c = 0; c <= segments; c++) {
    const idx = c * pointsCount + lastRow;
    botNx += normals.getX(idx);
    botNy += normals.getY(idx);
    botNz += normals.getZ(idx);
  }
  const botLen = Math.hypot(botNx, botNy, botNz) || 1;
  const botUx = botNx / botLen;
  const botUy = botNy / botLen;
  const botUz = botNz / botLen;
  for (let c = 0; c <= segments; c++) {
    normals.setXYZ(c * pointsCount + lastRow, botUx, botUy, botUz);
  }

  normals.needsUpdate = true;
}

export interface PlateModelProps {
  plateColor?: string;
  plateFinish?: string;
  rimTrim?: string;
  rimTrimCustomColor?: string | null;
  printCoverage?: string;
  designUrl?: string | null;
  designScale?: number;
  designRotation?: number;
  designOffsetX?: number;
  designOffsetY?: number;
  designOpacity?: number;
  diameterCm?: number;
}

export default function PlateModel(props?: PlateModelProps) {
  const store = usePlateStore();
  const plateColor = props?.plateColor ?? store.plateColor;
  const plateFinish = props?.plateFinish ?? store.plateFinish;
  const rimTrim = props?.rimTrim ?? store.rimTrim;
  const rimTrimCustomColor = props?.rimTrimCustomColor !== undefined ? props.rimTrimCustomColor : store.rimTrimCustomColor;
  const printCoverage = props?.printCoverage ?? store.printCoverage;
  const designUrl = props?.designUrl !== undefined ? props.designUrl : store.designUrl;
  const designScale = props?.designScale ?? store.designScale;
  const designRotation = props?.designRotation ?? store.designRotation;
  const designOffsetX = props?.designOffsetX ?? store.designOffsetX;
  const designOffsetY = props?.designOffsetY ?? store.designOffsetY;
  const designOpacity = props?.designOpacity ?? store.designOpacity;
  const diameterCm = props?.diameterCm ?? store.selectedSize.diameterCm;

  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const textureRef = useRef<THREE.Texture | null>(null);

  // 1. Generate realistic ceramic plate procedural geometry with 96 radial segments and welded seamless normals
  const plateGeometry = useMemo(() => {
    const points: THREE.Vector2[] = [];
    const relativeScale = diameterCm / 27;

    // Smooth spline curve for the top basin and flared rim surface (eliminates radial facet lines)
    const topSurface = new THREE.SplineCurve([
      new THREE.Vector2(0, 0.05 * relativeScale),
      new THREE.Vector2(0.35 * relativeScale, 0.052 * relativeScale),
      new THREE.Vector2(0.7 * relativeScale, 0.06 * relativeScale),
      new THREE.Vector2(1.05 * relativeScale, 0.088 * relativeScale),
      new THREE.Vector2(1.35 * relativeScale, 0.165 * relativeScale),
      new THREE.Vector2(1.55 * relativeScale, 0.235 * relativeScale),
      new THREE.Vector2(1.66 * relativeScale, 0.255 * relativeScale),
    ]);
    points.push(...topSurface.getPoints(20));

    // Rounded rim apex edge
    points.push(new THREE.Vector2(1.67 * relativeScale, 0.248 * relativeScale));
    points.push(new THREE.Vector2(1.64 * relativeScale, 0.215 * relativeScale));

    // Smooth underside curve towards the foot ring
    const bottomSlope = new THREE.SplineCurve([
      new THREE.Vector2(1.64 * relativeScale, 0.215 * relativeScale),
      new THREE.Vector2(1.42 * relativeScale, 0.14 * relativeScale),
      new THREE.Vector2(1.18 * relativeScale, 0.075 * relativeScale),
      new THREE.Vector2(1.05 * relativeScale, 0.06 * relativeScale),
    ]);
    points.push(...bottomSlope.getPoints(8).slice(1));

    // Footing ring (the rim on the bottom that sits on the table)
    points.push(new THREE.Vector2(1.02 * relativeScale, 0.0 * relativeScale)); // touches table at y = 0
    points.push(new THREE.Vector2(0.92 * relativeScale, 0.0 * relativeScale)); // flat foot base
    points.push(new THREE.Vector2(0.90 * relativeScale, 0.035 * relativeScale));

    // Center hollow underside
    points.push(new THREE.Vector2(0.6 * relativeScale, 0.04 * relativeScale));
    points.push(new THREE.Vector2(0, 0.04 * relativeScale));

    // 96 segments ensures perfectly round rim and porcelain curvature
    const SEGMENTS = 96;
    const lathe = new THREE.LatheGeometry(points, SEGMENTS);
    weldLatheSeamNormals(lathe, SEGMENTS, points.length);

    return lathe;
  }, [diameterCm]);

  // Clean up old geometry from GPU memory
  useEffect(() => {
    return () => {
      plateGeometry.dispose();
    };
  }, [plateGeometry]);

  // 2. Generate decal geometry conforming exactly to the curved top surface profile of the plate
  const decalGeometry = useMemo(() => {
    const relativeScale = diameterCm / 27;

    const topSurface = new THREE.SplineCurve([
      new THREE.Vector2(0, 0.05 * relativeScale),
      new THREE.Vector2(0.35 * relativeScale, 0.052 * relativeScale),
      new THREE.Vector2(0.7 * relativeScale, 0.06 * relativeScale),
      new THREE.Vector2(1.05 * relativeScale, 0.088 * relativeScale),
      new THREE.Vector2(1.35 * relativeScale, 0.165 * relativeScale),
      new THREE.Vector2(1.55 * relativeScale, 0.235 * relativeScale),
      new THREE.Vector2(1.66 * relativeScale, 0.255 * relativeScale),
    ]);

    const allPoints = topSurface.getPoints(20);
    // If 'center': covers the central basin floor (indices 0 to 10, radius up to ~1.05)
    // If 'full': covers the entire plate top surface up to the outer rim apex (radius 1.66)
    const isFull = (printCoverage || '').toLowerCase().trim() === 'full';
    const pointsSubset = isFull ? allPoints : allPoints.slice(0, 11);
    const maxR = isFull ? 1.66 * relativeScale : 1.05 * relativeScale;

    // Slight elevation along Y (+0.001 * relativeScale) to prevent Z-fighting with porcelain body
    const elevatedPoints = pointsSubset.map(
      (p) => new THREE.Vector2(p.x, p.y + 0.001 * relativeScale)
    );

    // Reverse point order so lathe faces and vertex normals point upwards
    const reversedPts = elevatedPoints.slice().reverse();

    const SEGMENTS = 96;
    const decalLathe = new THREE.LatheGeometry(reversedPts, SEGMENTS);
    weldLatheSeamNormals(decalLathe, SEGMENTS, reversedPts.length);

    // Planar UV projection from above: X -> horizontal U, -Z -> vertical V
    const pos = decalLathe.attributes.position;
    const uvs = decalLathe.attributes.uv;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const u = x / (2 * maxR) + 0.5;
      const v = -z / (2 * maxR) + 0.5;
      uvs.setXY(i, u, v);
    }
    uvs.needsUpdate = true;

    return decalLathe;
  }, [diameterCm, printCoverage]);

  useEffect(() => {
    return () => {
      decalGeometry.dispose();
    };
  }, [decalGeometry]);

  // 3. Manage dynamic custom texture loading with strict memory disposal
  useEffect(() => {
    if (!designUrl) {
      if (textureRef.current) {
        textureRef.current.dispose();
        textureRef.current = null;
      }
      setTexture(null);
      return;
    }

    let isSubscribed = true;
    const loader = new THREE.TextureLoader();

    loader.load(
      designUrl,
      (loadedTexture) => {
        if (!isSubscribed) {
          loadedTexture.dispose();
          return;
        }

        // Dispose previous texture before swapping to prevent GPU memory leak
        if (textureRef.current) {
          textureRef.current.dispose();
        }

        // Texture configuration for crisp rendering
        loadedTexture.generateMipmaps = true;
        loadedTexture.minFilter = THREE.LinearMipmapLinearFilter;
        loadedTexture.magFilter = THREE.LinearFilter;
        loadedTexture.wrapS = THREE.ClampToEdgeWrapping;
        loadedTexture.wrapT = THREE.ClampToEdgeWrapping;
        loadedTexture.colorSpace = THREE.SRGBColorSpace;
        loadedTexture.needsUpdate = true;

        textureRef.current = loadedTexture;
        setTexture(loadedTexture);
      },
      undefined,
      (err) => {
        console.error('Failed to load custom plate design texture', err);
      }
    );

    return () => {
      isSubscribed = false;
    };
  }, [designUrl]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (textureRef.current) {
        textureRef.current.dispose();
        textureRef.current = null;
      }
    };
  }, []);

  // 3. Update texture scale, offset, and rotation smoothly via UV matrix WITHOUT calling needsUpdate
  useEffect(() => {
    if (!texture) return;

    const s = Math.max(0.1, designScale);
    // In Three.js, texture.center.set(0.5, 0.5) establishes the pivot point for both scaling (repeat) and rotation.
    // Setting repeat to (1/s, 1/s) with center at (0.5, 0.5) zooms the decal directly outwards from the dead center.
    texture.center.set(0.5, 0.5);
    texture.repeat.set(1 / s, 1 / s);
    texture.offset.set(-designOffsetX, -designOffsetY);
    texture.rotation = (designRotation * Math.PI) / 180;
    // NOTE: texture.needsUpdate = true is intentionally NOT called here
    // In Three.js, UV matrix transforms update instantly via uniforms without re-uploading texture pixels to GPU!
  }, [texture, designScale, designRotation, designOffsetX, designOffsetY]);

  // 4. Material properties based on selected plate finish using lightweight, glossy MeshStandardMaterial
  const materialProps = useMemo(() => {
    switch (plateFinish) {
      case 'matte':
        return {
          roughness: 0.82,
          metalness: 0.0,
          envMapIntensity: 0.2,
        };
      case 'satin':
        return {
          roughness: 0.36,
          metalness: 0.03,
          envMapIntensity: 0.45,
        };
      case 'glossy':
      default:
        return {
          roughness: 0.12,
          metalness: 0.04,
          envMapIntensity: 0.75,
        };
    }
  }, [plateFinish]);

  // 5. Rim trim metal colors
  const rimTrimColor = useMemo(() => {
    if (!rimTrim) return null;
    const trim = (rimTrim || '').toLowerCase().trim();
    if (trim === 'none' || trim === 'polos' || trim === '') return null;
    if (trim.includes('gold') && !trim.includes('rose')) return '#e0b541';
    if (trim.includes('silver') || trim.includes('perak') || trim.includes('platinum')) return '#dcdcdc';
    if (trim.includes('rose')) return '#d48d7c';
    if (trim.includes('custom') || trim.startsWith('#') || rimTrimCustomColor) {
      return rimTrimCustomColor || (trim.startsWith('#') ? trim : '#d4af37');
    }
    return null;
  }, [rimTrim, rimTrimCustomColor]);

  const relativeScale = diameterCm / 27;

  return (
    <group position={[0, 0, 0]}>
      {/* Main Ceramic Plate Body */}
      <mesh geometry={plateGeometry}>
        <meshStandardMaterial
          color={plateColor}
          roughness={materialProps.roughness}
          metalness={materialProps.metalness}
          envMapIntensity={materialProps.envMapIntensity}
        />
      </mesh>

      {/* Dynamic Printed Custom Artwork Decal Mesh (Curved Surface) */}
      {texture && (
        <mesh geometry={decalGeometry}>
          <meshStandardMaterial
            map={texture}
            transparent={true}
            opacity={designOpacity}
            roughness={materialProps.roughness}
            metalness={materialProps.metalness}
            polygonOffset={true}
            polygonOffsetFactor={-2}
            polygonOffsetUnits={-2}
            depthWrite={false}
            side={THREE.FrontSide}
          />
        </mesh>
      )}

      {/* Optional Metallic Rim Trim (Gold / Silver / Rose-Gold) */}
      {rimTrimColor && (
        <mesh
          position={[0, 0.252 * relativeScale, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <torusGeometry
            args={[
              1.64 * relativeScale,
              0.016 * relativeScale,
              16,
              96,
            ]}
          />
          <meshStandardMaterial
            color={rimTrimColor}
            metalness={0.94}
            roughness={0.16}
          />
        </mesh>
      )}
    </group>
  );
}
