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
  hasBottomPole: boolean = true,
  centerPoleIndex: number = 0
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

  // 2. Harmonize center pole vertex at basin floor so there is zero pinching
  let topNx = 0, topNy = 0, topNz = 0;
  for (let c = 0; c <= segments; c++) {
    const idx = c * pointsCount + centerPoleIndex;
    topNx += normals.getX(idx);
    topNy += normals.getY(idx);
    topNz += normals.getZ(idx);
  }
  const topLen = Math.hypot(topNx, topNy, topNz) || 1;
  const topUx = topNx / topLen;
  const topUy = topNy / topLen;
  const topUz = topNz / topLen;
  for (let c = 0; c <= segments; c++) {
    normals.setXYZ(c * pointsCount + centerPoleIndex, topUx, topUy, topUz);
  }

  // 3. Harmonize bottom center pole vertex if present (for full plate geometry)
  if (hasBottomPole) {
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
  }

  normals.needsUpdate = true;
}

// Render high-precision procedural or custom rim patterns on 2048x2048 canvas
function renderRimPatternOnCanvas(
  ctx: CanvasRenderingContext2D,
  center: number,
  maxR: number,
  wellR: number,
  pattern: RimPattern,
  customRimImage?: HTMLImageElement | null,
  customRepeatCount: number = 24,
  customMode: 'repeat' | 'full' = 'repeat'
) {
  if (!pattern || pattern === 'none') return;

  const safeOuterR = maxR * 0.93;
  const safeInnerR = Math.max(wellR * 1.04, maxR * 0.72);
  const midR = (safeOuterR + safeInnerR) / 2;

  ctx.save();

  if (pattern === 'gold-double') {
    // 1. Double 24K Gold Line: Luxury hotel standard
    const rOuter = safeOuterR - 10;
    const rInner = safeInnerR + 15;

    ctx.beginPath();
    ctx.arc(center, center, rOuter, 0, Math.PI * 2);
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 6;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(center, center, rInner, 0, Math.PI * 2);
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 3.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(center, center, (rOuter + rInner) / 2, 0, Math.PI * 2);
    ctx.strokeStyle = '#F3E5AB';
    ctx.lineWidth = 1.2;
    ctx.stroke();
  } else if (pattern === 'gold-single') {
    // 2. Bold Luxury Gold Band
    ctx.beginPath();
    ctx.arc(center, center, midR, 0, Math.PI * 2);
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 8;
    ctx.stroke();
  } else if (pattern === 'silver-double') {
    // 3. Platinum Silver Double Ring
    const rOuter = safeOuterR - 10;
    const rInner = safeInnerR + 15;

    ctx.beginPath();
    ctx.arc(center, center, rOuter, 0, Math.PI * 2);
    ctx.strokeStyle = '#D1D5DB';
    ctx.lineWidth = 5.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(center, center, rInner, 0, Math.PI * 2);
    ctx.strokeStyle = '#9CA3AF';
    ctx.lineWidth = 3;
    ctx.stroke();
  } else if (pattern === 'black-modern') {
    // 4. Modern Minimalist Obsidian Pinstripe
    const rOuter = safeOuterR - 12;
    const rInner = safeInnerR + 16;

    ctx.beginPath();
    ctx.arc(center, center, rOuter, 0, Math.PI * 2);
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 4.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(center, center, rInner, 0, Math.PI * 2);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2.5;
    ctx.stroke();
  } else if (pattern === 'batik-kawung') {
    // 5. Batik Kawung Keraton: Royal 4-petal elliptical rosettes repeating around the rim
    const rOuter = safeOuterR - 8;
    const rInner = safeInnerR + 10;

    // Framing border rings
    ctx.beginPath();
    ctx.arc(center, center, rOuter, 0, Math.PI * 2);
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(center, center, rInner, 0, Math.PI * 2);
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 2.5;
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
        ctx.fillStyle = '#103b79'; // Royal indigo
        ctx.fill();
        ctx.strokeStyle = '#D4AF37'; // Gold edge
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(petalA * 0.65, 0, petalA * 0.25, petalB * 0.3, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        ctx.restore();
      }

      // Center gold diamond
      ctx.beginPath();
      ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#D4AF37';
      ctx.fill();

      ctx.restore();
    }
  } else if (pattern === 'batik-megamendung') {
    // 6. Batik Mega Mendung: Traditional Cirebon tiered cloud wave
    const rOuter = safeOuterR - 10;
    const rInner = safeInnerR + 10;

    ctx.beginPath();
    ctx.arc(center, center, rOuter, 0, Math.PI * 2);
    ctx.strokeStyle = '#0f2b5c';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(center, center, rInner, 0, Math.PI * 2);
    ctx.strokeStyle = '#0f2b5c';
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
      ctx.fillStyle = '#0f2b5c';
      ctx.fill();

      // Tier 2: Cobalt Blue
      ctx.beginPath();
      ctx.moveTo(-w * 0.32, 0);
      ctx.quadraticCurveTo(-w * 0.15, -12, 0, -4);
      ctx.quadraticCurveTo(w * 0.15, -14, w * 0.32, 0);
      ctx.quadraticCurveTo(w * 0.15, 9, 0, 5);
      ctx.quadraticCurveTo(-w * 0.15, 9, -w * 0.32, 0);
      ctx.fillStyle = '#2563eb';
      ctx.fill();

      // Tier 3: Sky Cyan
      ctx.beginPath();
      ctx.moveTo(-w * 0.18, 0);
      ctx.quadraticCurveTo(-w * 0.08, -6, 0, -2);
      ctx.quadraticCurveTo(w * 0.08, -7, w * 0.18, 0);
      ctx.quadraticCurveTo(w * 0.08, 4, 0, 2);
      ctx.quadraticCurveTo(-w * 0.08, 4, -w * 0.18, 0);
      ctx.fillStyle = '#38bdf8';
      ctx.fill();

      ctx.restore();
    }
  } else if (pattern === 'greek-key') {
    // 7. Greek Key Meander Border
    const rOuter = safeOuterR - 8;
    const rInner = safeInnerR + 10;

    ctx.beginPath();
    ctx.arc(center, center, rOuter, 0, Math.PI * 2);
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(center, center, rInner, 0, Math.PI * 2);
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 3;
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
      ctx.strokeStyle = '#D4AF37';
      ctx.lineWidth = 2.5;
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
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(center, center, rInner, 0, Math.PI * 2);
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 2;
    ctx.stroke();

    const count = 54;
    for (let i = 0; i < count; i++) {
      const angle = (i * Math.PI * 2) / count;
      const x = center + Math.cos(angle) * midR;
      const y = center + Math.sin(angle) * midR;

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
  } else if (pattern === 'custom' && customRimImage) {
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

  // 2. Generator Geometri Parametrik: Anatomi Penampang Piring Porselen Asli (Pipih, Elegan, Tanpa Undercut)
  const { plateGeometry, decalGeometry, rimApexY } = useMemo(() => {
    const wellRadius = outerRadius * wellRatio;
    const footRingRadius = outerRadius * footRingRadiusRatio;

    // Sistem koordinat Y (Y = 0 adalah dasar cincin kaki menempel di meja)
    const footHeight = thickness * 0.6; // ~0.023 unit
    const wellBottomY = footHeight + thickness; // Permukaan atas dasar cekungan (~0.061 unit)
    const rimTopY = wellBottomY + wellDepth; // Titik tertinggi piring pada bibir paling luar (~0.171 unit)
    const lipThickness = thickness * 0.75;

    // A. Permukaan Atas (Top Surface)
    // Datar di tengah dengan subdivisi terdistribusi merata, transisi halus di pundak cekungan, lalu miring naik ke bibir luar
    const floorR = wellRadius * (wellRatio >= 0.8 ? 0.78 : 0.82);
    const topPoints: THREE.Vector2[] = [];

    // 1. Dasar Cekungan Datar (Uniform sampling agar UV mapping teratur dan tidak melompat 1 segmen raksasa)
    const floorSegments = 14;
    for (let i = 0; i <= floorSegments; i++) {
      const t = i / floorSegments;
      topPoints.push(new THREE.Vector2(floorR * t, wellBottomY));
    }

    // 2. Dinding Lekukan Cekungan (Shoulder transition)
    const shoulderCurve = new THREE.QuadraticBezierCurve(
      new THREE.Vector2(floorR, wellBottomY),
      new THREE.Vector2(wellRadius * 0.96, wellBottomY + wellDepth * 0.08),
      new THREE.Vector2(wellRadius, wellBottomY + wellDepth * 0.38)
    );
    const shoulderPoints = shoulderCurve.getPoints(14).slice(1);
    topPoints.push(...shoulderPoints);

    // 3. Kemiringan Bibir Piring (Rim incline menuju puncak piring)
    const rimMidR = wellRadius + (outerRadius - wellRadius) * 0.50;
    const rimMidY = wellBottomY + wellDepth * 0.75;
    const rimCurve = new THREE.QuadraticBezierCurve(
      new THREE.Vector2(wellRadius, wellBottomY + wellDepth * 0.38),
      new THREE.Vector2(rimMidR, rimMidY),
      new THREE.Vector2(outerRadius, rimTopY)
    );
    const rimPoints = rimCurve.getPoints(16).slice(1);
    topPoints.push(...rimPoints);

    // B. Ujung Bibir Piring (Outer Lip Edge)
    // Setengah lingkaran membulat halus di ujung luar (tidak tajam)
    const lipPath = new THREE.Path();
    lipPath.moveTo(outerRadius, rimTopY);
    lipPath.quadraticCurveTo(
      outerRadius + lipThickness * 0.25,
      rimTopY - lipThickness * 0.5,
      outerRadius,
      rimTopY - lipThickness
    );
    const lipPoints = lipPath.getPoints(6).slice(1);

    // C. Permukaan Bawah (Bottom Surface)
    // Sejajar dengan kemiringan bibir atas menuju titik tepat di luar cincin kaki (tanpa lekukan masuk/undercut)
    const bottomPath = new THREE.Path();
    bottomPath.moveTo(outerRadius, rimTopY - lipThickness);
    const cpX = Math.min(wellRadius * 0.98, outerRadius - 0.06);
    const cpY = wellBottomY + wellDepth * 0.35 - lipThickness * 0.85;
    const pEndBottomX = footRingRadius + 0.04;
    const pEndBottomY = footHeight + thickness * 0.3;
    bottomPath.quadraticCurveTo(cpX, cpY, pEndBottomX, pEndBottomY);
    const bottomPoints = bottomPath.getPoints(20).slice(1);

    // D. Cincin Kaki Penopang & Tengah Bawah (Foot Ring & Center Underside)
    // Menempel rapi di meja pada Y = 0 dan menutup datar di tengah bawah
    const footPoints = [
      new THREE.Vector2(footRingRadius, 0),
      new THREE.Vector2(footRingRadius - 0.04, 0),
      new THREE.Vector2(footRingRadius - 0.05, footHeight),
      new THREE.Vector2(0, footHeight),
    ];

    const allPlatePoints = [
      ...topPoints,
      ...lipPoints,
      ...bottomPoints,
      ...footPoints,
    ];

    const SEGMENTS = 96;
    const plateGeom = new THREE.LatheGeometry(allPlatePoints, SEGMENTS);
    weldLatheSeamNormals(plateGeom, SEGMENTS, allPlatePoints.length, true, 0);
    plateGeom.computeVertexNormals();

    // E. Decal Geometry (permukaan atas yang sama persis, sedikit dinaikkan +0.0012 untuk cegah Z-fighting)
    const elevatedPoints = topPoints.map(
      (p) => new THREE.Vector2(p.x, p.y + 0.0012)
    );
    const reversedDecalPoints = elevatedPoints.slice().reverse();
    const decalGeom = new THREE.LatheGeometry(reversedDecalPoints, SEGMENTS);
    weldLatheSeamNormals(decalGeom, SEGMENTS, reversedDecalPoints.length, false, reversedDecalPoints.length - 1);
    decalGeom.computeVertexNormals();

    // Hitung jarak kumulatif permukaan (surface arc-length) di sepanjang profil top surface piring
    let totalArc = 0;
    const arcLengths: number[] = [0];
    for (let i = 1; i < topPoints.length; i++) {
      const dx = topPoints[i].x - topPoints[i - 1].x;
      const dy = topPoints[i].y - topPoints[i - 1].y;
      totalArc += Math.hypot(dx, dy);
      arcLengths.push(totalArc);
    }
    const normR = totalArc > 0 ? arcLengths.map((a) => a / totalArc) : [];

    // Proyeksi UV ortografis tampak atas (Planar Projection):
    // Memastikan gambar dari tampak atas/depan memiliki proporsi visual 1:1 yang sempurna dan presisi,
    // tidak melar atau merenggang secara non-linear akibat kelengkungan cekungan.
    const pos = decalGeom.attributes.position;
    const uvs = decalGeom.attributes.uv;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);

      // Proyeksi planar langsung dari radius horizontal (x, z) terhadap outerRadius piring
      const u = (x / outerRadius) * 0.5 + 0.5;
      const v = (-z / outerRadius) * 0.5 + 0.5;
      uvs.setXY(i, u, v);
    }
    uvs.needsUpdate = true;

    return {
      plateGeometry: plateGeom,
      decalGeometry: decalGeom,
      rimApexY: rimTopY,
    };
  }, [outerRadius, wellRatio, wellDepth, thickness, footRingRadiusRatio]);

  useEffect(() => {
    return () => {
      plateGeometry.dispose();
      decalGeometry.dispose();
    };
  }, [plateGeometry, decalGeometry]);

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

  // 4. Canvas 2D Composite Texture: Porcelain base fill + motif + procedural AO crease
  const [compositeTexture, setCompositeTexture] = useState<THREE.CanvasTexture | null>(null);
  const compositeTextureRef = useRef<THREE.CanvasTexture | null>(null);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const size = 2048;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // A. WAJIB isi seluruh latar canvas dengan warna dasar porselen hangat (#fcfbf9) terlebih dahulu
    ctx.fillStyle = effectivePlateColor;
    ctx.fillRect(0, 0, size, size);

    const center = size / 2;
    const maxR = size / 2;
    // Titik dasar datar cekungan tengah (flat basin floor) yang presisi sesuai geometri parametrik
    const activeWellRatio = Math.max(0.2, Math.min(0.9, wellRatio || 0.64));
    const effectiveFloorRatio = activeWellRatio * (activeWellRatio >= 0.8 ? 0.78 : 0.82);
    const floorR = maxR * effectiveFloorRatio;
    const wellR = maxR * activeWellRatio;

    // B. Gambar Ornamen / List Bibir Piring (Rim Pattern) jika dipilih
    renderRimPatternOnCanvas(
      ctx,
      center,
      maxR,
      wellR,
      rimPattern,
      loadedCustomRimImage,
      customRimPatternRepeat,
      customRimPatternMode
    );

    // C. Gambar motif / logo jika tersedia
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

        // Skala logo yang pas di ketebalan bibir piring (default diameter ~220px)
        const rimWidth = maxR * 0.93 - wellR;
        const baseDiameter = Math.min(rimWidth * 1.05, 270) * designScale;

        let drawW = baseDiameter;
        let drawH = baseDiameter;
        if (aspect > 1) {
          drawH = drawW / aspect;
        } else if (aspect < 1) {
          drawW = drawH * aspect;
        }

        // Jika ada list melingkar di belakang logo, beri clearance porselen halus agar logo sangat tajam
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
          // Strictly batasi motif tepat di dasar datar cekungan tengah agar tidak naik/terpotong di dinding lereng curam piring
          ctx.beginPath();
          ctx.arc(center, center, floorR, 0, Math.PI * 2);
          ctx.clip();
        }

        // Transformasi posisi, rotasi, dan skala dari pusat piring (center, center)
        ctx.translate(center + designOffsetX * size, center + designOffsetY * size);
        ctx.rotate((designRotation * Math.PI) / 180);

        // Skala diameter dasar:
        // - Mode Cekungan Tengah: Diberikan safe padding 90% dari radius dasar datar cekungan (floorR * 2 * 0.90)
        // - Mode Seluruh Permukaan: Merentang ke seluruh permukaan piring dengan safe margin 94% (size * 0.94)
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

    // D. Efek Ambient Occlusion (AO) prosedural melingkar halus di garis lipatan dalam cekungan tengah
    const aoGrad = ctx.createRadialGradient(
      center,
      center,
      wellR * 0.90,
      center,
      center,
      wellR * 1.05
    );
    aoGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    aoGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.03)'); // bayangan lipatan cekungan penegas lekukan piring sangat halus
    aoGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = aoGrad;
    ctx.beginPath();
    ctx.arc(center, center, maxR, 0, Math.PI * 2);
    ctx.fill();

    // Buat CanvasTexture dengan SRGB ColorSpace
    const newTex = new THREE.CanvasTexture(canvas);
    newTex.colorSpace = THREE.SRGBColorSpace;
    newTex.generateMipmaps = true;
    newTex.minFilter = THREE.LinearMipmapLinearFilter;
    newTex.magFilter = THREE.LinearFilter;
    newTex.wrapS = THREE.ClampToEdgeWrapping;
    newTex.wrapT = THREE.ClampToEdgeWrapping;
    newTex.needsUpdate = true;

    if (compositeTextureRef.current) {
      compositeTextureRef.current.dispose();
    }
    compositeTextureRef.current = newTex;
    setCompositeTexture(newTex);
  }, [
    loadedImage,
    loadedCustomRimImage,
    effectivePlateColor,
    rimPattern,
    customRimPatternRepeat,
    customRimPatternMode,
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

  useEffect(() => {
    return () => {
      if (compositeTextureRef.current) {
        compositeTextureRef.current.dispose();
        compositeTextureRef.current = null;
      }
    };
  }, []);

  // 5. Konfigurasi 3 Pilihan TEKSTUR GLASIR (FINISHING) dengan MeshPhysicalMaterial
  // WAJIB metalness: 0.0 pada semua glasir keramik agar tidak abu-abu / kubah hitam
  const materialProps = useMemo(() => {
    switch (plateFinish) {
      case 'matte':
        // Matte Doff: Tekstur halus alami tanpa pantulan tajam, sheen lembut
        return {
          roughness: 0.62,
          metalness: 0.0,
          clearcoat: 0.05,
          clearcoatRoughness: 0.50,
          ior: 1.45,
          reflectivity: 0.15,
          sheen: 0.35,
          sheenRoughness: 0.60,
          sheenColor: '#ffffff',
          envMapIntensity: 0.35,
        };
      case 'satin':
        // Semi-Satin: Kilau lembut membaur / silky highlight
        return {
          roughness: 0.38,
          metalness: 0.0,
          clearcoat: 0.65,
          clearcoatRoughness: 0.22,
          ior: 1.48,
          reflectivity: 0.40,
          sheen: 0.20,
          sheenRoughness: 0.40,
          sheenColor: '#ffffff',
          envMapIntensity: 0.60,
        };
      case 'glossy':
      default:
        // Kilap Porselen: Bodi keramik padat di bawah lapisan kaca glasir jernih berkilau
        return {
          roughness: 0.26,
          metalness: 0.0,
          clearcoat: 1.0,
          clearcoatRoughness: 0.04,
          ior: 1.52,
          reflectivity: 0.65,
          sheen: 0.0,
          sheenRoughness: 0.0,
          sheenColor: '#ffffff',
          envMapIntensity: 0.85,
        };
    }
  }, [plateFinish]);

  // Update material ketika konfigurasi glasir atau tekstur berubah
  const bodyMaterialRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const decalMaterialRef = useRef<THREE.MeshPhysicalMaterial>(null);

  useEffect(() => {
    if (bodyMaterialRef.current) {
      bodyMaterialRef.current.needsUpdate = true;
    }
    if (decalMaterialRef.current) {
      decalMaterialRef.current.needsUpdate = true;
    }
  }, [plateFinish, materialProps, compositeTexture]);

  // 6. List Emas 24K / Perak (Metallic Rim Trim)
  const rimTrimColor = useMemo(() => {
    if (!rimTrim) return null;
    const trim = (rimTrim || '').toLowerCase().trim();
    if (trim === 'none' || trim === 'polos' || trim === '') return null;
    if (trim.includes('gold') && !trim.includes('rose')) return '#d4af37';
    if (trim.includes('silver') || trim.includes('perak') || trim.includes('platinum')) return '#dcdcdc';
    if (trim.includes('rose')) return '#b76e79';
    if (trim.includes('custom') || trim.startsWith('#') || rimTrimCustomColor) {
      return rimTrimCustomColor || (trim.startsWith('#') ? trim : '#d4af37');
    }
    return null;
  }, [rimTrim, rimTrimCustomColor]);

  return (
    <group position={[0, 0, 0]}>
      {/* Main Ceramic Plate Body with Shadow Support */}
      <mesh geometry={plateGeometry} castShadow receiveShadow>
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
        />
      </mesh>

      {/* Dynamic Printed Custom Artwork & Glaze Decal Mesh with Shadow Support */}
      {compositeTexture && (
        <mesh geometry={decalGeometry} receiveShadow>
          <meshPhysicalMaterial
            key={compositeTexture.uuid}
            ref={decalMaterialRef}
            map={compositeTexture}
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
            polygonOffset={true}
            polygonOffsetFactor={-2}
            polygonOffsetUnits={-2}
            depthWrite={true}
            side={THREE.FrontSide}
          />
        </mesh>
      )}

      {/* Optional Metallic Rim Trim (Gold / Silver / Rose-Gold) with Shadow Support */}
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
              16,
              96,
            ]}
          />
          <meshStandardMaterial
            color={rimTrimColor}
            metalness={0.96}
            roughness={0.14}
            envMapIntensity={1.2}
          />
        </mesh>
      )}
    </group>
  );
}
