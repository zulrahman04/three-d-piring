'use client';

import React, { useMemo, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { usePlateStore } from '@/store/usePlateStore';

import { PlateSize, RimPattern, LogoPlacement } from '@/types/plate';

// Helper function to eliminate the radial lighting seam by welding normals where theta=0 meets theta=2PI
function weldLatheSeamNormals(
  geometry: THREE.BufferGeometry,
  segments: number,
  pointsCount: number,
  bottomPoleNormalY: number | null = -1,
  topPoleNormalY: number | null = 1
) {
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

  // 2. Harmonize start pole (j = 0) so there is zero pinching at center
  if (bottomPoleNormalY !== null) {
    for (let c = 0; c <= segments; c++) {
      normals.setXYZ(c * pointsCount, 0, bottomPoleNormalY, 0);
    }
  }

  // 3. Harmonize end pole (j = pointsCount - 1) so there is zero pinching at center
  if (topPoleNormalY !== null) {
    const lastRow = pointsCount - 1;
    for (let c = 0; c <= segments; c++) {
      normals.setXYZ(c * pointsCount + lastRow, 0, topPoleNormalY, 0);
    }
  }

  normals.needsUpdate = true;
}

// Create metallic 24K gold or platinum linear gradient for realistic specular sheen on rim patterns
function createMetallicGradient(
  ctx: CanvasRenderingContext2D,
  center: number,
  radius: number,
  type: 'gold' | 'silver'
) {
  const grad = ctx.createLinearGradient(
    center - radius,
    center - radius,
    center + radius,
    center + radius
  );
  if (type === 'gold') {
    grad.addColorStop(0.0, '#B38728');
    grad.addColorStop(0.22, '#FBF5B7');
    grad.addColorStop(0.45, '#D4AF37');
    grad.addColorStop(0.68, '#FFF3B0');
    grad.addColorStop(0.85, '#AA771C');
    grad.addColorStop(1.0, '#E5C158');
  } else {
    grad.addColorStop(0.0, '#9CA3AF');
    grad.addColorStop(0.25, '#F9FAFB');
    grad.addColorStop(0.5, '#D1D5DB');
    grad.addColorStop(0.75, '#FFFFFF');
    grad.addColorStop(1.0, '#6B7280');
  }
  return grad;
}

// Render high-precision procedural or custom rim patterns on 2048x2048 canvas
// Also supports rendering height/relief mask (isBumpPass = true) for realistic 3D tactile glaze emboss
function renderRimPatternOnCanvas(
  ctx: CanvasRenderingContext2D,
  center: number,
  maxR: number,
  wellR: number,
  pattern: RimPattern,
  customRimImage?: HTMLImageElement | null,
  customRepeatCount: number = 24,
  customMode: 'repeat' | 'full' = 'repeat',
  isBumpPass: boolean = false
) {
  if (!pattern || pattern === 'none') return;

  const safeOuterR = maxR * 0.93;
  const safeInnerR = Math.max(wellR * 1.04, maxR * 0.72);
  const midR = (safeOuterR + safeInnerR) / 2;

  ctx.save();

  const goldStroke = isBumpPass ? '#ffffff' : createMetallicGradient(ctx, center, safeOuterR, 'gold');
  const silverStroke = isBumpPass ? '#ffffff' : createMetallicGradient(ctx, center, safeOuterR, 'silver');

  if (!isBumpPass) {
    // Subtle micro-shadow under raised enamel/gold rim patterns for 3D depth
    ctx.shadowColor = 'rgba(0, 0, 0, 0.14)';
    ctx.shadowBlur = 2.5;
    ctx.shadowOffsetY = 1;
  }

  if (pattern === 'gold-double') {
    // 1. Double 24K Gold Line: Luxury hotel standard
    const rOuter = safeOuterR - 10;
    const rInner = safeInnerR + 15;

    ctx.beginPath();
    ctx.arc(center, center, rOuter, 0, Math.PI * 2);
    ctx.strokeStyle = goldStroke;
    ctx.lineWidth = 6.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(center, center, rInner, 0, Math.PI * 2);
    ctx.strokeStyle = goldStroke;
    ctx.lineWidth = 3.8;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(center, center, (rOuter + rInner) / 2, 0, Math.PI * 2);
    ctx.strokeStyle = isBumpPass ? '#b0b0b0' : '#FFF6CC';
    ctx.lineWidth = 1.4;
    ctx.stroke();
  } else if (pattern === 'gold-single') {
    // 2. Bold Luxury Gold Band
    ctx.beginPath();
    ctx.arc(center, center, midR, 0, Math.PI * 2);
    ctx.strokeStyle = goldStroke;
    ctx.lineWidth = 8.5;
    ctx.stroke();
  } else if (pattern === 'silver-double') {
    // 3. Platinum Silver Double Ring
    const rOuter = safeOuterR - 10;
    const rInner = safeInnerR + 15;

    ctx.beginPath();
    ctx.arc(center, center, rOuter, 0, Math.PI * 2);
    ctx.strokeStyle = silverStroke;
    ctx.lineWidth = 5.8;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(center, center, rInner, 0, Math.PI * 2);
    ctx.strokeStyle = silverStroke;
    ctx.lineWidth = 3.2;
    ctx.stroke();
  } else if (pattern === 'black-modern') {
    // 4. Modern Minimalist Obsidian Pinstripe
    const rOuter = safeOuterR - 12;
    const rInner = safeInnerR + 16;

    ctx.beginPath();
    ctx.arc(center, center, rOuter, 0, Math.PI * 2);
    ctx.strokeStyle = isBumpPass ? '#c8c8c8' : '#1E293B';
    ctx.lineWidth = 4.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(center, center, rInner, 0, Math.PI * 2);
    ctx.strokeStyle = isBumpPass ? '#a0a0a0' : '#475569';
    ctx.lineWidth = 2.5;
    ctx.stroke();
  } else if (pattern === 'batik-kawung') {
    // 5. Batik Kawung Keraton: Royal 4-petal elliptical rosettes repeating around the rim
    const rOuter = safeOuterR - 8;
    const rInner = safeInnerR + 10;

    // Framing border rings
    ctx.beginPath();
    ctx.arc(center, center, rOuter, 0, Math.PI * 2);
    ctx.strokeStyle = goldStroke;
    ctx.lineWidth = 3.2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(center, center, rInner, 0, Math.PI * 2);
    ctx.strokeStyle = goldStroke;
    ctx.lineWidth = 2.6;
    ctx.stroke();

    const count = 36;
    const rosetteR = midR;
    const petalA = (rOuter - rInner) * 0.38;
    const petalB = (rOuter - rInner) * 0.22;

    for (let i = 0; i < count; i++) {
      const angle = (i * Math.PI * 2) / count;
      const x = center + Math.cos(angle) * rosetteR;
      const y = center + Math.sin(angle) * rosetteR;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);

      // 4 Petals
      for (let p = 0; p < 4; p++) {
        ctx.save();
        ctx.rotate((p * Math.PI) / 2);

        ctx.beginPath();
        ctx.ellipse(petalA * 0.65, 0, petalA * 0.55, petalB * 0.7, 0, 0, Math.PI * 2);
        ctx.fillStyle = isBumpPass ? '#bdbdbd' : '#103b79'; // Royal indigo
        ctx.fill();
        ctx.strokeStyle = isBumpPass ? '#ffffff' : '#D4AF37'; // Gold edge
        ctx.lineWidth = 1.3;
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(petalA * 0.65, 0, petalA * 0.25, petalB * 0.3, 0, 0, Math.PI * 2);
        ctx.fillStyle = isBumpPass ? '#e5e5e5' : '#ffffff';
        ctx.fill();

        ctx.restore();
      }

      // Center gold diamond
      ctx.beginPath();
      ctx.arc(0, 0, 3.6, 0, Math.PI * 2);
      ctx.fillStyle = isBumpPass ? '#ffffff' : '#E5C158';
      ctx.fill();

      ctx.restore();
    }
  } else if (pattern === 'batik-megamendung') {
    // 6. Batik Mega Mendung: Traditional Cirebon tiered cloud wave
    const rOuter = safeOuterR - 10;
    const rInner = safeInnerR + 10;

    ctx.beginPath();
    ctx.arc(center, center, rOuter, 0, Math.PI * 2);
    ctx.strokeStyle = isBumpPass ? '#d4d4d4' : '#0f2b5c';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(center, center, rInner, 0, Math.PI * 2);
    ctx.strokeStyle = isBumpPass ? '#d4d4d4' : '#0f2b5c';
    ctx.lineWidth = 2;
    ctx.stroke();

    const count = 24;
    const w = (safeOuterR - safeInnerR) * 0.85;

    for (let i = 0; i < count; i++) {
      const angle = (i * Math.PI * 2) / count;
      const x = center + Math.cos(angle) * midR;
      const y = center + Math.sin(angle) * midR;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle + Math.PI / 2);

      // Tier 1: Dark Indigo
      ctx.beginPath();
      ctx.moveTo(-w * 0.45, 0);
      ctx.quadraticCurveTo(-w * 0.2, -18, 0, -6);
      ctx.quadraticCurveTo(w * 0.2, -22, w * 0.45, 0);
      ctx.quadraticCurveTo(w * 0.2, 14, 0, 8);
      ctx.quadraticCurveTo(-w * 0.2, 14, -w * 0.45, 0);
      ctx.fillStyle = isBumpPass ? '#b8b8b8' : '#0f2b5c';
      ctx.fill();

      // Tier 2: Cobalt Blue
      ctx.beginPath();
      ctx.moveTo(-w * 0.32, 0);
      ctx.quadraticCurveTo(-w * 0.15, -12, 0, -4);
      ctx.quadraticCurveTo(w * 0.15, -14, w * 0.32, 0);
      ctx.quadraticCurveTo(w * 0.15, 9, 0, 5);
      ctx.quadraticCurveTo(-w * 0.15, 9, -w * 0.32, 0);
      ctx.fillStyle = isBumpPass ? '#dcdcdc' : '#2563eb';
      ctx.fill();

      // Tier 3: Sky Cyan
      ctx.beginPath();
      ctx.moveTo(-w * 0.18, 0);
      ctx.quadraticCurveTo(-w * 0.08, -6, 0, -2);
      ctx.quadraticCurveTo(w * 0.08, -7, w * 0.18, 0);
      ctx.quadraticCurveTo(w * 0.08, 4, 0, 2);
      ctx.quadraticCurveTo(-w * 0.08, 4, -w * 0.18, 0);
      ctx.fillStyle = isBumpPass ? '#ffffff' : '#38bdf8';
      ctx.fill();

      ctx.restore();
    }
  } else if (pattern === 'greek-key') {
    // 7. Greek Key Meander Border
    const rOuter = safeOuterR - 8;
    const rInner = safeInnerR + 10;

    ctx.beginPath();
    ctx.arc(center, center, rOuter, 0, Math.PI * 2);
    ctx.strokeStyle = goldStroke;
    ctx.lineWidth = 3.2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(center, center, rInner, 0, Math.PI * 2);
    ctx.strokeStyle = goldStroke;
    ctx.lineWidth = 3.2;
    ctx.stroke();

    const count = 48;
    const h = (rOuter - rInner) * 0.55;

    for (let i = 0; i < count; i++) {
      const angle = (i * Math.PI * 2) / count;
      const x = center + Math.cos(angle) * midR;
      const y = center + Math.sin(angle) * midR;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle + Math.PI / 2);

      ctx.beginPath();
      ctx.strokeStyle = isBumpPass ? '#ffffff' : '#D4AF37';
      ctx.lineWidth = 2.6;
      ctx.lineCap = 'square';
      ctx.moveTo(-16, -h / 2);
      ctx.lineTo(16, -h / 2);
      ctx.lineTo(16, h / 2);
      ctx.lineTo(-4, h / 2);
      ctx.lineTo(-4, -h / 6);
      ctx.lineTo(8, -h / 6);
      ctx.stroke();

      ctx.restore();
    }
  } else if (pattern === 'pearl-dots') {
    // 8. Pearl Beaded Luxury Rim
    const rOuter = safeOuterR - 12;
    const rInner = safeInnerR + 14;

    ctx.beginPath();
    ctx.arc(center, center, rOuter, 0, Math.PI * 2);
    ctx.strokeStyle = goldStroke;
    ctx.lineWidth = 2.2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(center, center, rInner, 0, Math.PI * 2);
    ctx.strokeStyle = goldStroke;
    ctx.lineWidth = 2.2;
    ctx.stroke();

    const count = 54;
    for (let i = 0; i < count; i++) {
      const angle = (i * Math.PI * 2) / count;
      const x = center + Math.cos(angle) * midR;
      const y = center + Math.sin(angle) * midR;

      if (isBumpPass) {
        const bumpGrad = ctx.createRadialGradient(x, y, 0.5, x, y, 7);
        bumpGrad.addColorStop(0, '#ffffff');
        bumpGrad.addColorStop(0.7, '#d4d4d4');
        bumpGrad.addColorStop(1, '#808080');
        ctx.beginPath();
        ctx.arc(x, y, 7, 0, Math.PI * 2);
        ctx.fillStyle = bumpGrad;
        ctx.fill();
      } else {
        // 3D Embossed golden pearl
        const radGrad = ctx.createRadialGradient(x - 2, y - 2, 1, x, y, 7);
        radGrad.addColorStop(0, '#FFFBEB');
        radGrad.addColorStop(0.35, '#F59E0B');
        radGrad.addColorStop(0.85, '#B45309');
        radGrad.addColorStop(1, '#78350F');

        ctx.beginPath();
        ctx.arc(x, y, 6.5, 0, Math.PI * 2);
        ctx.fillStyle = radGrad;
        ctx.fill();
      }
    }
  } else if (pattern === 'custom' && customRimImage && !isBumpPass) {
    // 9. Custom Customer Pattern (Radial Tile Repeat or Full Ring)
    if (customMode === 'repeat') {
      const count = Math.max(4, Math.min(64, customRepeatCount || 24));
      const naturalW = customRimImage.naturalWidth || customRimImage.width || 1;
      const naturalH = customRimImage.naturalHeight || customRimImage.height || 1;
      const aspect = naturalW / naturalH;
      const targetH = (safeOuterR - safeInnerR) * 0.85;
      const targetW = targetH * aspect;

      for (let i = 0; i < count; i++) {
        const angle = (i * Math.PI * 2) / count;
        const x = center + Math.cos(angle) * midR;
        const y = center + Math.sin(angle) * midR;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle + Math.PI / 2);
        ctx.drawImage(customRimImage, -targetW / 2, -targetH / 2, targetW, targetH);
        ctx.restore();
      }
    } else {
      // Full Circular Ring Mode: Scaled 1:1 to cover the plate rim
      const diameter = maxR * 2 * 0.94;
      ctx.drawImage(
        customRimImage,
        center - diameter / 2,
        center - diameter / 2,
        diameter,
        diameter
      );
    }
  }

  ctx.restore();
}

export interface PlateModelProps {
  plateColor?: string;
  plateFinish?: string;
  rimTrim?: string;
  rimTrimCustomColor?: string | null;
  rimPattern?: RimPattern;
  customRimPatternUrl?: string | null;
  customRimPatternRepeat?: number;
  customRimPatternMode?: 'repeat' | 'full';
  logoPlacement?: LogoPlacement;
  printCoverage?: string;
  designUrl?: string | null;
  designScale?: number;
  designRotation?: number;
  designOffsetX?: number;
  designOffsetY?: number;
  designOpacity?: number;
  selectedSize?: Partial<PlateSize> | PlateSize;
  diameterCm?: number;
}

export default function PlateModel(props?: PlateModelProps) {
  const store = usePlateStore();
  const selectedSize = props?.selectedSize ?? store.selectedSize;
  const plateColor = props?.plateColor ?? store.plateColor;
  const plateFinish = props?.plateFinish ?? store.plateFinish;
  const rimTrim = props?.rimTrim ?? store.rimTrim;
  const rimTrimCustomColor = props?.rimTrimCustomColor !== undefined ? props.rimTrimCustomColor : store.rimTrimCustomColor;
  const rimPattern = props?.rimPattern ?? store.rimPattern;
  const customRimPatternUrl = props?.customRimPatternUrl !== undefined ? props.customRimPatternUrl : store.customRimPatternUrl;
  const customRimPatternRepeat = props?.customRimPatternRepeat ?? store.customRimPatternRepeat;
  const customRimPatternMode = props?.customRimPatternMode ?? store.customRimPatternMode;
  const logoPlacement = props?.logoPlacement ?? store.logoPlacement;
  const printCoverage = props?.printCoverage ?? store.printCoverage;
  const designUrl = props?.designUrl !== undefined ? props.designUrl : store.designUrl;
  const designScale = props?.designScale ?? store.designScale;
  const designRotation = props?.designRotation ?? store.designRotation;
  const designOffsetX = props?.designOffsetX ?? store.designOffsetX;
  const designOffsetY = props?.designOffsetY ?? store.designOffsetY;
  const designOpacity = props?.designOpacity ?? store.designOpacity;

  // 1. Parameter Geometri 3D Parametrik dari Flat Master Ukuran Piring yang aktif
  const outerRadius = selectedSize?.outerRadius ?? 1.35;
  const wellRatio = selectedSize?.wellRatio ?? 0.64;
  const wellDepth = selectedSize?.wellDepth ?? 0.11;
  const thickness = selectedSize?.thickness ?? 0.038; // Tebal porselen konstan
  const footRingRadiusRatio = selectedSize?.footRingRadiusRatio ?? 0.56;

  const effectivePlateColor = useMemo(() => {
    if (!plateColor || plateColor.toLowerCase() === '#ffffff' || plateColor.toLowerCase() === '#faf7f2') {
      return '#fcfbf9';
    }
    return plateColor;
  }, [plateColor]);

  // 2. Generator Geometri Parametrik: Anatomi Penampang Piring Porselen Asli
  //    Dengan orientasi normal keluar (Outward Normals), Single-Pass Top Surface (tanpa overdraw),
  //    serta Cincin Kaki Bawah Tanpa Glasir (Unglazed Bisque Foot Ring) seperti porselen hotel asli.
  const { plateUndersideGeometry, topSurfaceGeometry, footRingBisqueGeometry, rimApexY } = useMemo(() => {
    const wellRadius = outerRadius * wellRatio;
    const footRingRadius = outerRadius * footRingRadiusRatio;

    // Sistem koordinat Y (Y = 0 adalah dasar cincin kaki menempel di meja)
    const footHeight = thickness * 0.6; // ~0.023 unit
    const wellBottomY = footHeight + thickness; // Permukaan atas dasar cekungan (~0.061 unit)
    const rimTopY = wellBottomY + wellDepth; // Titik tertinggi piring pada bibir paling luar (~0.171 unit)
    const lipThickness = thickness * 0.75;

    // A. Permukaan Atas (Top Surface: dari pusat r=0 menuju bibir luar r=outerRadius)
    // Pastikan dasar datar cekungan (floorR) selalu berada di dalam tumpuan cincin kaki (footRingRadius)
    // agar dinding cekungan dalam tidak pernah menembus atau menggembung di luar bodi bawah piring.
    const floorR = Math.min(footRingRadius * 0.94, wellRadius * 0.78);
    const topPoints: THREE.Vector2[] = [];

    // 1. Dasar Cekungan Datar (Uniform sampling agar UV mapping teratur)
    const floorSegments = 14;
    for (let i = 0; i <= floorSegments; i++) {
      const t = i / floorSegments;
      topPoints.push(new THREE.Vector2(floorR * t, wellBottomY));
    }

    // 2. Dinding Lekukan Cekungan (Shoulder transition - naik mulus di atas cincin kaki tanpa menggembung)
    const shoulderSpan = Math.max(0.05, wellRadius - floorR);
    const shoulderCpX = floorR + shoulderSpan * 0.52;
    const shoulderCpY = wellBottomY + wellDepth * 0.08;
    const shoulderEndY = wellBottomY + wellDepth * 0.42;
    const shoulderCurve = new THREE.QuadraticBezierCurve(
      new THREE.Vector2(floorR, wellBottomY),
      new THREE.Vector2(shoulderCpX, shoulderCpY),
      new THREE.Vector2(wellRadius, shoulderEndY)
    );
    const shoulderPoints = shoulderCurve.getPoints(16).slice(1);
    topPoints.push(...shoulderPoints);

    // 3. Kemiringan Bibir Piring (Rim incline menuju puncak piring)
    const rimMidR = wellRadius + (outerRadius - wellRadius) * 0.48;
    const rimMidY = wellBottomY + wellDepth * 0.74;
    const rimCurve = new THREE.QuadraticBezierCurve(
      new THREE.Vector2(wellRadius, shoulderEndY),
      new THREE.Vector2(rimMidR, rimMidY),
      new THREE.Vector2(outerRadius, rimTopY)
    );
    const rimPoints = rimCurve.getPoints(18).slice(1);
    topPoints.push(...rimPoints);

    // Helper interpolasi tinggi permukaan atas y_top(r) untuk menjamin ketebalan fisik dinding piring
    const getTopYAtRadius = (r: number): number => {
      if (r <= floorR) return wellBottomY;
      if (r >= outerRadius) return rimTopY;
      for (let i = 0; i < topPoints.length - 1; i++) {
        const p0 = topPoints[i];
        const p1 = topPoints[i + 1];
        if (r >= p0.x && r <= p1.x) {
          const span = p1.x - p0.x;
          const t = span > 0.00001 ? (r - p0.x) / span : 0;
          return p0.y + t * (p1.y - p0.y);
        }
      }
      return wellBottomY;
    };

    // B. Ujung Bibir Piring (Outer Lip Edge - setengah lingkaran membulat halus di ujung luar)
    const lipPath = new THREE.Path();
    lipPath.moveTo(outerRadius, rimTopY);
    lipPath.quadraticCurveTo(
      outerRadius + lipThickness * 0.28,
      rimTopY - lipThickness * 0.5,
      outerRadius,
      rimTopY - lipThickness
    );
    const lipPoints = lipPath.getPoints(8).slice(1);

    // C. Permukaan Bawah (Bottom Surface - Kurva tunggal tirus & ramping dari bibir luar ke cincin kaki, 100% bebas gembung)
    const pStartBottomX = outerRadius;
    const pStartBottomY = rimTopY - lipThickness;
    const pEndBottomX = footRingRadius + 0.025;
    const pEndBottomY = footHeight + thickness * 0.22;
    const cpBottomX = pEndBottomX + (pStartBottomX - pEndBottomX) * 0.42;
    const cpBottomY = pEndBottomY + (pStartBottomY - pEndBottomY) * 0.34;

    const bottomCurve = new THREE.QuadraticBezierCurve(
      new THREE.Vector2(pStartBottomX, pStartBottomY),
      new THREE.Vector2(cpBottomX, cpBottomY),
      new THREE.Vector2(pEndBottomX, pEndBottomY)
    );
    const minWallThickness = thickness * 0.65;
    const bottomPoints = bottomCurve
      .getPoints(24)
      .slice(1)
      .map((pt) => {
        const maxAllowedY = getTopYAtRadius(pt.x) - minWallThickness;
        return new THREE.Vector2(pt.x, Math.min(pt.y, maxAllowedY));
      });

    // D. Cincin Kaki Penopang & Tengah Bawah (Foot Ring & Center Underside)
    const footPoints = [
      new THREE.Vector2(footRingRadius + 0.01, 0.004),
      new THREE.Vector2(footRingRadius, 0),
      new THREE.Vector2(footRingRadius - 0.038, 0),
      new THREE.Vector2(footRingRadius - 0.048, 0.004),
      new THREE.Vector2(footRingRadius - 0.055, footHeight),
      new THREE.Vector2(0, footHeight),
    ];

    const SEGMENTS = 96;

    // 1. Top Surface Geometry (Dibalik dari outerRadius -> 0 agar di Three.js LatheGeometry normal menghadap ke ATAS / +Y)
    const reversedTopPoints = topPoints.slice().reverse();
    const topGeom = new THREE.LatheGeometry(reversedTopPoints, SEGMENTS);
    weldLatheSeamNormals(topGeom, SEGMENTS, reversedTopPoints.length, null, 1);

    // Proyeksi UV ortografis tampak atas (Planar Projection 1:1)
    const pos = topGeom.attributes.position;
    const uvs = topGeom.attributes.uv;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const u = (x / outerRadius) * 0.5 + 0.5;
      const v = (-z / outerRadius) * 0.5 + 0.5;
      uvs.setXY(i, u, v);
    }
    uvs.needsUpdate = true;

    // 2. Underside & Outer Lip Geometry (Dibalik dari r=0 bawah -> footPoints -> bottomPoints -> lipPoints -> outerRadius
    //    agar semua normal menghadap KELUAR / BAWAH secara fisik dan tidak ter-cull saat Tampak Bawah)
    const undersideChain = [
      new THREE.Vector2(outerRadius, rimTopY),
      ...lipPoints,
      ...bottomPoints,
      ...footPoints,
    ].reverse();

    const underGeom = new THREE.LatheGeometry(undersideChain, SEGMENTS);
    weldLatheSeamNormals(underGeom, SEGMENTS, undersideChain.length, -1, null);

    // Harmonize boundary normals between Top Surface (j=0) and Underside Lip (j=last) at (outerRadius, rimTopY)
    // so the outer rim lip edge has a 100% seamless specular highlight transition
    const topNorms = topGeom.attributes.normal;
    const underNorms = underGeom.attributes.normal;
    const topBoundaryRow = 0;
    const underBoundaryRow = undersideChain.length - 1;
    const topPtsLen = reversedTopPoints.length;
    const underPtsLen = undersideChain.length;

    for (let c = 0; c <= SEGMENTS; c++) {
      const tIdx = c * topPtsLen + topBoundaryRow;
      const uIdx = c * underPtsLen + underBoundaryRow;
      const nx = topNorms.getX(tIdx) + underNorms.getX(uIdx);
      const ny = topNorms.getY(tIdx) + underNorms.getY(uIdx);
      const nz = topNorms.getZ(tIdx) + underNorms.getZ(uIdx);
      const len = Math.hypot(nx, ny, nz) || 1;
      topNorms.setXYZ(tIdx, nx / len, ny / len, nz / len);
      underNorms.setXYZ(uIdx, nx / len, ny / len, nz / len);
    }
    topNorms.needsUpdate = true;
    underNorms.needsUpdate = true;

    // 3. Unglazed Bisque Foot Ring Contact Strip (Cincin kaki porselen tanpa glasir di bagian bawah)
    const bisquePoints = [
      new THREE.Vector2(footRingRadius - 0.042, 0.002),
      new THREE.Vector2(footRingRadius - 0.036, -0.0008),
      new THREE.Vector2(footRingRadius - 0.019, -0.0015),
      new THREE.Vector2(footRingRadius, -0.0008),
      new THREE.Vector2(footRingRadius + 0.004, 0.002),
    ];
    const bisqueGeom = new THREE.LatheGeometry(bisquePoints, SEGMENTS);
    weldLatheSeamNormals(bisqueGeom, SEGMENTS, bisquePoints.length, null, null);

    return {
      plateUndersideGeometry: underGeom,
      topSurfaceGeometry: topGeom,
      footRingBisqueGeometry: bisqueGeom,
      rimApexY: rimTopY,
    };
  }, [outerRadius, wellRatio, wellDepth, thickness, footRingRadiusRatio]);

  useEffect(() => {
    return () => {
      plateUndersideGeometry.dispose();
      topSurfaceGeometry.dispose();
      footRingBisqueGeometry.dispose();
    };
  }, [plateUndersideGeometry, topSurfaceGeometry, footRingBisqueGeometry]);

  // 3. Image loader for custom motif / artwork
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!designUrl) {
      setLoadedImage(null);
      return;
    }

    let active = true;
    const img = new Image();
    if (!designUrl.startsWith('data:')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => {
      if (active) {
        setLoadedImage(img);
      }
    };
    img.onerror = (err) => {
      console.warn('Gagal memuat gambar motif piring', err);
    };
    img.src = designUrl;
    if (img.complete && img.naturalWidth > 0) {
      setLoadedImage(img);
    }

    return () => {
      active = false;
    };
  }, [designUrl]);

  // Image loader for custom rim pattern image
  const [loadedCustomRimImage, setLoadedCustomRimImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!customRimPatternUrl) {
      setLoadedCustomRimImage(null);
      return;
    }

    let active = true;
    const img = new Image();
    if (!customRimPatternUrl.startsWith('data:')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => {
      if (active) {
        setLoadedCustomRimImage(img);
      }
    };
    img.onerror = (err) => {
      console.warn('Gagal memuat gambar rim pattern kustom', err);
    };
    img.src = customRimPatternUrl;
    if (img.complete && img.naturalWidth > 0) {
      setLoadedCustomRimImage(img);
    }

    return () => {
      active = false;
    };
  }, [customRimPatternUrl]);

  // 4. ZERO-LAG TWO-TIER CANVAS PIPELINE:
  //    - Tier 1 (baseRimCanvasRef): Caches the porcelain base + Rim Pattern + 3D Bump Map.
  //      Only re-renders when plateColor or rimPattern changes (NOT when dragging logo sliders!).
  //    - Tier 2 (compositeCanvasRef + persistent compositeTexture): Reuses ONE persistent CanvasTexture
  //      and ONE shader program (zero WebGL shader recompilation, < 1.5ms slider updates at 60 FPS).
  const baseRimCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const compositeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const bumpCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [texturesReady, setTexturesReady] = useState(false);
  const compositeTextureRef = useRef<THREE.CanvasTexture | null>(null);
  const bumpTextureRef = useRef<THREE.CanvasTexture | null>(null);

  // Initialize persistent offscreen canvases and Three.js textures once on client mount
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const size = 2048;
    const bumpSize = 1024;

    const baseCanvas = document.createElement('canvas');
    baseCanvas.width = size;
    baseCanvas.height = size;
    baseRimCanvasRef.current = baseCanvas;

    const compCanvas = document.createElement('canvas');
    compCanvas.width = size;
    compCanvas.height = size;
    compositeCanvasRef.current = compCanvas;

    const bumpCanvas = document.createElement('canvas');
    bumpCanvas.width = bumpSize;
    bumpCanvas.height = bumpSize;
    bumpCanvasRef.current = bumpCanvas;

    const compTex = new THREE.CanvasTexture(compCanvas);
    compTex.colorSpace = THREE.SRGBColorSpace;
    compTex.generateMipmaps = true;
    compTex.minFilter = THREE.LinearMipmapLinearFilter;
    compTex.magFilter = THREE.LinearFilter;
    compTex.anisotropy = 4;
    compTex.wrapS = THREE.ClampToEdgeWrapping;
    compTex.wrapT = THREE.ClampToEdgeWrapping;
    compositeTextureRef.current = compTex;

    const bumpTex = new THREE.CanvasTexture(bumpCanvas);
    bumpTex.colorSpace = THREE.NoColorSpace;
    bumpTex.generateMipmaps = false;
    bumpTex.minFilter = THREE.LinearFilter;
    bumpTex.magFilter = THREE.LinearFilter;
    bumpTex.wrapS = THREE.ClampToEdgeWrapping;
    bumpTex.wrapT = THREE.ClampToEdgeWrapping;
    bumpTextureRef.current = bumpTex;

    setTexturesReady(true);

    return () => {
      compTex.dispose();
      bumpTex.dispose();
      compositeTextureRef.current = null;
      bumpTextureRef.current = null;
    };
  }, []);

  // Tier 1 Effect: Render Base Porcelain + Rim Pattern + 3D Relief Bump Map
  // (Only runs when plate color or rim pattern changes, NOT on logo slider moves!)
  const [baseLayerVersion, setBaseLayerVersion] = useState(0);

  useEffect(() => {
    if (!texturesReady || !baseRimCanvasRef.current || !bumpCanvasRef.current) return;

    const size = 2048;
    const baseCanvas = baseRimCanvasRef.current;
    const ctx = baseCanvas.getContext('2d');
    if (!ctx) return;

    const center = size / 2;
    const maxR = size / 2;
    const activeWellRatio = Math.max(0.2, Math.min(0.9, wellRatio || 0.64));
    const wellR = maxR * activeWellRatio;

    // A. Isi latar canvas dengan warna dasar porselen
    ctx.fillStyle = effectivePlateColor;
    ctx.fillRect(0, 0, size, size);

    // B. Gambar Ornamen / List Bibir Piring (Rim Pattern) dengan gradasi emas/perak realistis
    renderRimPatternOnCanvas(
      ctx,
      center,
      maxR,
      wellR,
      rimPattern,
      loadedCustomRimImage,
      customRimPatternRepeat,
      customRimPatternMode,
      false
    );

    // C. Update 3D Tactile Bump Map untuk efek timbul pada motif bibir & lekukan cekungan
    const bumpCanvas = bumpCanvasRef.current;
    const bCtx = bumpCanvas.getContext('2d');
    if (bCtx && bumpTextureRef.current) {
      const bSize = bumpCanvas.width;
      const bCenter = bSize / 2;
      const bMaxR = bSize / 2;
      const bWellR = bMaxR * activeWellRatio;

      // Neutral mid-level height
      bCtx.fillStyle = '#808080';
      bCtx.fillRect(0, 0, bSize, bSize);

      // Subtle concave shoulder ridge transition on bump map
      const ridgeGrad = bCtx.createRadialGradient(
        bCenter,
        bCenter,
        bWellR * 0.92,
        bCenter,
        bCenter,
        bWellR * 1.06
      );
      ridgeGrad.addColorStop(0, '#808080');
      ridgeGrad.addColorStop(0.5, '#747474');
      ridgeGrad.addColorStop(0.85, '#8a8a8a');
      ridgeGrad.addColorStop(1, '#808080');
      bCtx.fillStyle = ridgeGrad;
      bCtx.fillRect(0, 0, bSize, bSize);

      // Render raised relief for rim patterns (Pearl Dots, Gold Lines, Batik, Greek Key)
      if (rimPattern && rimPattern !== 'none' && rimPattern !== 'custom') {
        renderRimPatternOnCanvas(
          bCtx,
          bCenter,
          bMaxR,
          bWellR,
          rimPattern,
          null,
          customRimPatternRepeat,
          customRimPatternMode,
          true
        );
      }

      bumpTextureRef.current.needsUpdate = true;
    }

    setBaseLayerVersion((v) => v + 1);
  }, [
    texturesReady,
    effectivePlateColor,
    rimPattern,
    loadedCustomRimImage,
    customRimPatternRepeat,
    customRimPatternMode,
    wellRatio,
  ]);

  // Tier 2 Effect: Fast Composite Redraw (Blits cached Tier 1 + Logo Transform + Physical Basin AO)
  // Coalesced with requestAnimationFrame for 0-lag 60 FPS slider responsiveness
  useEffect(() => {
    if (!texturesReady || !compositeCanvasRef.current || !baseRimCanvasRef.current || !compositeTextureRef.current) {
      return;
    }

    const rafId = requestAnimationFrame(() => {
      const compCanvas = compositeCanvasRef.current;
      const baseCanvas = baseRimCanvasRef.current;
      const compTex = compositeTextureRef.current;
      if (!compCanvas || !baseCanvas || !compTex) return;

      const size = compCanvas.width;
      const ctx = compCanvas.getContext('2d');
      if (!ctx) return;

      const center = size / 2;
      const maxR = size / 2;
      const activeWellRatio = Math.max(0.2, Math.min(0.9, wellRatio || 0.64));
      const effectiveFloorRatio = activeWellRatio * (activeWellRatio >= 0.8 ? 0.78 : 0.82);
      const floorR = maxR * effectiveFloorRatio;
      const wellR = maxR * activeWellRatio;

      // 1. Fast hardware-accelerated copy of cached Base Porcelain + Rim Pattern (< 0.5ms)
      ctx.drawImage(baseCanvas, 0, 0);

      // 2. Gambar motif / logo jika tersedia
      if (loadedImage) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, designOpacity));

        const imgW = loadedImage.naturalWidth || loadedImage.width || 1;
        const imgH = loadedImage.naturalHeight || loadedImage.height || 1;
        const aspect = imgW / imgH;

        if (logoPlacement === 'top-rim') {
          // POSISI JAM 12 (Bibir Atas): Logo hotel / brand eksklusif di bibir piring
          const rimMidR = (maxR * 0.93 + Math.max(wellR * 1.04, maxR * 0.72)) / 2;
          const targetX = center + designOffsetX * size;
          const targetY = center - rimMidR + designOffsetY * size;

          const rimWidth = maxR * 0.93 - wellR;
          const baseDiameter = Math.min(rimWidth * 1.05, 270) * designScale;

          let drawW = baseDiameter;
          let drawH = baseDiameter;
          if (aspect > 1) {
            drawH = drawW / aspect;
          } else if (aspect < 1) {
            drawW = drawH * aspect;
          }

          if (rimPattern && rimPattern !== 'none') {
            ctx.save();
            ctx.beginPath();
            ctx.arc(targetX, targetY, Math.max(drawW, drawH) * 0.58, 0, Math.PI * 2);
            ctx.fillStyle = effectivePlateColor;
            ctx.shadowColor = 'rgba(0, 0, 0, 0.16)';
            ctx.shadowBlur = 12;
            ctx.fill();
            ctx.restore();
          }

          ctx.translate(targetX, targetY);
          ctx.rotate((designRotation * Math.PI) / 180);
          ctx.drawImage(loadedImage, -drawW / 2, -drawH / 2, drawW, drawH);
        } else {
          // POSISI TENGAH (Center) ATAU BEBAS (Free)
          const isCenterOnly = (printCoverage || '').toLowerCase().trim() === 'center' && logoPlacement === 'center';
          if (isCenterOnly) {
            ctx.beginPath();
            ctx.arc(center, center, floorR, 0, Math.PI * 2);
            ctx.clip();
          }

          ctx.translate(center + designOffsetX * size, center + designOffsetY * size);
          ctx.rotate((designRotation * Math.PI) / 180);

          const baseDiameter = isCenterOnly ? floorR * 2 * 0.90 : size * 0.94;

          let drawW = baseDiameter * designScale;
          let drawH = baseDiameter * designScale;
          if (aspect > 1) {
            drawH = drawW / aspect;
          } else if (aspect < 1) {
            drawW = drawH * aspect;
          }

          ctx.drawImage(loadedImage, -drawW / 2, -drawH / 2, drawW, drawH);
        }

        ctx.restore();
      }

      // 3. Realistic Ceramic Basin Shoulder Ambient Occlusion (AO) & Rim Specular Contour
      //    Memberikan kedalaman fisik nyata antara dasar cekungan, dinding miring, dan bibir piring
      const aoGrad = ctx.createRadialGradient(
        center,
        center,
        floorR * 0.94,
        center,
        center,
        wellR * 1.08
      );
      aoGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      aoGrad.addColorStop(0.45, 'rgba(15, 23, 42, 0.038)'); // Lipatan dalam cekungan (inner well crease)
      aoGrad.addColorStop(0.82, 'rgba(255, 255, 255, 0.045)'); // Punggung bahu cekungan (shoulder crown highlight)
      aoGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = aoGrad;
      ctx.beginPath();
      ctx.arc(center, center, maxR, 0, Math.PI * 2);
      ctx.fill();

      // Upload updated pixels to GPU without recreating texture or recompiling shader
      compTex.needsUpdate = true;
    });

    return () => cancelAnimationFrame(rafId);
  }, [
    texturesReady,
    baseLayerVersion,
    loadedImage,
    effectivePlateColor,
    rimPattern,
    logoPlacement,
    printCoverage,
    wellRatio,
    outerRadius,
    selectedSize?.id,
    designScale,
    designRotation,
    designOffsetX,
    designOffsetY,
    designOpacity,
  ]);

  // 5. Konfigurasi 3 Pilihan TEKSTUR GLASIR (FINISHING) dengan MeshPhysicalMaterial
  // WAJIB metalness: 0.0 pada semua glasir keramik agar tidak abu-abu / kubah hitam
  const materialProps = useMemo(() => {
    switch (plateFinish) {
      case 'matte':
        // Matte Doff: Tekstur stoneware halus alami dengan sheen beludru lembut
        return {
          roughness: 0.58,
          metalness: 0.0,
          clearcoat: 0.08,
          clearcoatRoughness: 0.45,
          ior: 1.46,
          reflectivity: 0.18,
          sheen: 0.35,
          sheenRoughness: 0.55,
          sheenColor: '#ffffff',
          envMapIntensity: 0.42,
        };
      case 'satin':
        // Semi-Satin: Kilau porselen lembut membaur / silky highlight
        return {
          roughness: 0.34,
          metalness: 0.0,
          clearcoat: 0.68,
          clearcoatRoughness: 0.20,
          ior: 1.49,
          reflectivity: 0.45,
          sheen: 0.18,
          sheenRoughness: 0.35,
          sheenColor: '#ffffff',
          envMapIntensity: 0.68,
        };
      case 'glossy':
      default:
        // Kilap Porselen Fine Dining: Bodi keramik padat di bawah lapisan kaca glasir jernih berkilau
        return {
          roughness: 0.20,
          metalness: 0.0,
          clearcoat: 1.0,
          clearcoatRoughness: 0.035,
          ior: 1.54,
          reflectivity: 0.72,
          sheen: 0.08,
          sheenRoughness: 0.25,
          sheenColor: '#fffdf9',
          envMapIntensity: 0.92,
        };
    }
  }, [plateFinish]);

  const bodyMaterialRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const topMaterialRef = useRef<THREE.MeshPhysicalMaterial>(null);

  useEffect(() => {
    if (bodyMaterialRef.current) {
      bodyMaterialRef.current.needsUpdate = true;
    }
    if (topMaterialRef.current) {
      topMaterialRef.current.needsUpdate = true;
    }
  }, [plateFinish, materialProps, texturesReady]);

  // 6. List Emas 24K / Perak (Metallic Rim Trim)
  const rimTrimColor = useMemo(() => {
    if (!rimTrim) return null;
    const trim = (rimTrim || '').toLowerCase().trim();
    if (trim === 'none' || trim === 'polos' || trim === '') return null;
    if (trim.includes('gold') && !trim.includes('rose')) return '#d4af37';
    if (trim.includes('silver') || trim.includes('perak') || trim.includes('platinum')) return '#e2e8f0';
    if (trim.includes('rose')) return '#c07a84';
    if (trim.includes('custom') || trim.startsWith('#') || rimTrimCustomColor) {
      return rimTrimCustomColor || (trim.startsWith('#') ? trim : '#d4af37');
    }
    return null;
  }, [rimTrim, rimTrimCustomColor]);

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Permukaan Atas Piring (Single-Pass Glazed Top Surface + Motif + 3D Embossed Rim Pattern) */}
      <mesh geometry={topSurfaceGeometry} castShadow receiveShadow>
        <meshPhysicalMaterial
          ref={topMaterialRef}
          color={texturesReady ? '#ffffff' : effectivePlateColor}
          map={texturesReady ? compositeTextureRef.current : null}
          bumpMap={texturesReady ? bumpTextureRef.current : null}
          bumpScale={0.0028}
          roughness={materialProps.roughness}
          metalness={materialProps.metalness}
          clearcoat={materialProps.clearcoat}
          clearcoatRoughness={materialProps.clearcoatRoughness}
          ior={materialProps.ior}
          reflectivity={materialProps.reflectivity}
          sheen={materialProps.sheen}
          sheenRoughness={materialProps.sheenRoughness}
          sheenColor={materialProps.sheenColor}
          envMapIntensity={materialProps.envMapIntensity}
          side={THREE.FrontSide}
        />
      </mesh>

      {/* 2. Bibir Luar & Bodi Bawah Porselen (Outward-Normals Glazed Underside & Rounded Lip) */}
      <mesh geometry={plateUndersideGeometry} castShadow receiveShadow>
        <meshPhysicalMaterial
          ref={bodyMaterialRef}
          color={effectivePlateColor}
          roughness={materialProps.roughness}
          metalness={materialProps.metalness}
          clearcoat={materialProps.clearcoat}
          clearcoatRoughness={materialProps.clearcoatRoughness}
          ior={materialProps.ior}
          reflectivity={materialProps.reflectivity}
          sheen={materialProps.sheen}
          sheenRoughness={materialProps.sheenRoughness}
          sheenColor={materialProps.sheenColor}
          envMapIntensity={materialProps.envMapIntensity}
          side={THREE.FrontSide}
        />
      </mesh>

      {/* 3. Cincin Kaki Penopang Bawah Tanpa Glasir (Authentic Unglazed Bisque Foot Ring) */}
      <mesh geometry={footRingBisqueGeometry} receiveShadow>
        <meshStandardMaterial
          color="#ebe5dc"
          roughness={0.88}
          metalness={0.0}
          envMapIntensity={0.15}
          polygonOffset={true}
          polygonOffsetFactor={-1}
          polygonOffsetUnits={-1}
        />
      </mesh>

      {/* 4. Optional Metallic Rim Trim (24K Gold / Platinum Silver / Rose-Gold Electroplated Edge) */}
      {rimTrimColor && (
        <mesh
          position={[0, rimApexY - 0.003, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          castShadow
          receiveShadow
        >
          <torusGeometry
            args={[
              outerRadius - 0.014,
              0.016,
              20,
              96,
            ]}
          />
          <meshPhysicalMaterial
            color={rimTrimColor}
            metalness={0.94}
            roughness={0.12}
            clearcoat={0.65}
            clearcoatRoughness={0.08}
            envMapIntensity={1.45}
          />
        </mesh>
      )}
    </group>
  );
}
