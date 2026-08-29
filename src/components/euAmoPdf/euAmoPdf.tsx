import React, { useState, useCallback } from 'react';
import { Box, Paper, Button, Typography, List, ListItem, ListItemText, ListItemAvatar, Avatar, IconButton, LinearProgress, ToggleButton, ToggleButtonGroup } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import DeleteIcon from '@mui/icons-material/Delete';
import { PDFDocument } from 'pdf-lib';
// pdfjs will be dynamically imported when needed

const acceptTypes = 'application/pdf,image/*';

const EuAmoPdf: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [merging, setMerging] = useState(false);
  const [format, setFormat] = useState<'pdf' | 'image'>('pdf');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewMime, setPreviewMime] = useState<string | null>(null);
  const [editingImages, setEditingImages] = useState<Array<{ id: number; src: string; x: number; y: number; width: number; height: number; originalWidth: number; originalHeight: number }>>([]);
  const [isEditing, setIsEditing] = useState(false);

  const startDrag = (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const img = editingImages.find(it => it.id === id);
    if (!img) return;
    const origX = img.x;
    const origY = img.y;
    const onMove = (ev: MouseEvent) => {
      setEditingImages(prev => prev.map(it => it.id === id ? { ...it, x: Math.max(0, origX + (ev.clientX - startX)), y: Math.max(0, origY + (ev.clientY - startY)) } : it));
    };
    const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const startResize = (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const img = editingImages.find(it => it.id === id);
    if (!img) return;
    const origW = img.width;
    const origH = img.height;
    const onMove = (ev: MouseEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      setEditingImages(prev => prev.map(it => it.id === id ? { ...it, width: Math.max(10, origW + dx), height: Math.max(10, origH + dy) } : it));
    };
    const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const generateFinalFromEditing = async () => {
    if (editingImages.length === 0) return;
    const canvasWidth = Math.max(...editingImages.map(i => i.x + i.width));
    const canvasHeight = Math.max(...editingImages.map(i => i.y + i.height));
    const outCanvas = document.createElement('canvas');
    outCanvas.width = canvasWidth;
    outCanvas.height = canvasHeight;
    const outCtx = outCanvas.getContext('2d');
    if (!outCtx) throw new Error('Canvas não suportado');

    // draw each image in order
    for (const it of editingImages) {
      const el = document.getElementById(`edit-img-${it.id}`) as HTMLImageElement | null;
      if (!el) continue;
      outCtx.drawImage(el, it.x, it.y, it.width, it.height);
    }

    await new Promise<void>((res) => outCanvas.toBlob((b) => {
      if (!b) { res(); return; }
      if (previewUrl) { try { URL.revokeObjectURL(previewUrl); } catch (e) { /* ignore */ } }
      const url = URL.createObjectURL(b);
      setPreviewUrl(url);
      setPreviewMime('image/png');
      setIsEditing(false);
      setEditingImages([]);
      // scroll to preview
      // eslint-disable-next-line no-console
      console.log('Preview final gerado (png):', url);
      setTimeout(() => { const el = document.getElementById('euamopdf-preview'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }, 150);
      res();
    }, 'image/png'));
  };

  const addFiles = useCallback((newFiles: FileList | null) => {
    if (!newFiles) return;
    const arr = Array.from(newFiles);
    setFiles(prev => [...prev, ...arr]);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => addFiles(e.target.files);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    addFiles(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const integrar = async () => {
    if (files.length === 0) return;
    setMerging(true);
    try {
      if (format === 'pdf') {
        const outPdf = await PDFDocument.create();

        for (const file of files) {
          const arrayBuffer = await file.arrayBuffer();
          const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

          if (isPdf) {
            const src = await PDFDocument.load(arrayBuffer);
            const copied = await outPdf.copyPages(src, src.getPageIndices());
            copied.forEach(p => outPdf.addPage(p));
          } else if (file.type.startsWith('image/') || /\.(png|jpe?g|gif|webp)$/i.test(file.name)) {
            const mime = file.type;
            let embedded: any;
            if (mime === 'image/png' || file.name.toLowerCase().endsWith('.png')) {
              embedded = await outPdf.embedPng(arrayBuffer);
            } else {
              embedded = await outPdf.embedJpg(arrayBuffer);
            }
            const { width, height } = embedded.size();
            const page = outPdf.addPage([width, height]);
            page.drawImage(embedded, { x: 0, y: 0, width, height });
          } else {
            // Unknown type: try to treat as image
            try {
              const embedded = await outPdf.embedJpg(arrayBuffer);
              const { width, height } = embedded.size();
              const page = outPdf.addPage([width, height]);
              page.drawImage(embedded, { x: 0, y: 0, width, height });
            } catch (err) {
              // skip unsupported file
              // eslint-disable-next-line no-console
              console.warn('Unsupported file skipped', file.name, err);
            }
          }
        }

        const pdfBytes = await outPdf.save();
        const _uint8 = pdfBytes instanceof Uint8Array ? pdfBytes : new Uint8Array(pdfBytes as any);
        const arrayBufferForBlob = _uint8.buffer.slice(_uint8.byteOffset, _uint8.byteOffset + _uint8.byteLength);
        const blob = new Blob([arrayBufferForBlob], { type: 'application/pdf' });
        // show preview instead of auto-download
        if (previewUrl) {
          try { URL.revokeObjectURL(previewUrl); } catch (e) { /* ignore */ }
        }
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        setPreviewMime('application/pdf');
        // log and scroll to preview
        // eslint-disable-next-line no-console
        console.log('Preview gerado (pdf):', url);
        setTimeout(() => { const el = document.getElementById('euamopdf-preview'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }, 150);
      } else {
        // Integrate into single image (PNG)
        const imagesData: HTMLImageElement[] = [];

        for (const file of files) {
          const arrayBuffer = await file.arrayBuffer();
          const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

          if (isPdf) {
            // @ts-ignore: dynamic import of optional dependency
            const pdfjs = await import('pdfjs-dist');
            // Try to set workerSrc to the same version as the loaded pdfjs module to avoid version mismatch.
            try {
              // Attempt to read version from common exports
              const version = (pdfjs && (pdfjs.version || (pdfjs as any).default?.version)) || null;
              if (version) {
                // @ts-ignore
                pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.js`;
              }
            } catch (e) {
              // ignore
            }
            const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
            // Use only the first page of each PDF
            try {
              const page = await pdf.getPage(1);
              const viewport = page.getViewport({ scale: 1.5 });
              const canvas = document.createElement('canvas');
              canvas.width = Math.ceil(viewport.width);
              canvas.height = Math.ceil(viewport.height);
              const ctx = canvas.getContext('2d');
              if (ctx) {
                // @ts-ignore
                await page.render({ canvasContext: ctx, viewport }).promise;
                const img = new Image();
                img.src = canvas.toDataURL('image/png');
                await new Promise<void>((res) => { img.onload = () => res(); img.onerror = () => res(); });
                imagesData.push(img);
              }
            } catch (err) {
              // if getting page 1 fails, skip this file
              // eslint-disable-next-line no-console
              console.warn('Não foi possível renderizar a primeira página do PDF', file.name, err);
            }
          } else {
            // image file
            const blob = new Blob([arrayBuffer], { type: file.type || 'image/png' });
            const url = URL.createObjectURL(blob);
            const img = new Image();
            img.src = url;
            await new Promise<void>((res) => { img.onload = () => res(); img.onerror = () => res(); });
            imagesData.push(img);
            URL.revokeObjectURL(url);
          }
        }

        if (imagesData.length === 0) {
          throw new Error('Nenhuma imagem gerada para integrar.');
        }

        // prepare editable images so the user can move/resize them before finalizing
        const imgsForEdit = imagesData.map((img, idx) => ({
          id: idx,
          src: img.src,
          x: 10,
          y: idx === 0 ? 10 : 10 + imagesData.slice(0, idx).reduce((s, im) => s + im.height, 0) + (idx * 10),
          width: img.width,
          height: img.height,
          originalWidth: img.width,
          originalHeight: img.height,
        }));
        setEditingImages(imgsForEdit);
        setIsEditing(true);
        setMerging(false);
        return;
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Erro ao integrar arquivos', err);
      alert('Ocorreu um erro ao integrar os arquivos. Veja o console para detalhes.');
    } finally {
      setMerging(false);
    }
  };

  return (
    <Paper sx={{ p: 2 }} elevation={3} onDragOver={e => e.preventDefault()} onDrop={handleDrop}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Box display="flex" gap={2} alignItems="center">
          <UploadFileIcon />
          <Typography variant="h6">Envie PDFs ou imagens</Typography>
        </Box>
        <Box>
          <input
            id="file-input-euamopdf"
            type="file"
            accept={acceptTypes}
            multiple
            style={{ display: 'none' }}
            onChange={handleInputChange}
          />
          <label htmlFor="file-input-euamopdf">
            <Button variant="outlined" component="span">Adicionar</Button>
          </label>
          <ToggleButtonGroup
            value={format}
            exclusive
            size="small"
            sx={{ ml: 1 }}
            onChange={(_, v) => { if (v) setFormat(v); }}
          >
            <ToggleButton value="pdf">PDF</ToggleButton>
            <ToggleButton value="image">Imagem</ToggleButton>
          </ToggleButtonGroup>
          <Button color="primary" sx={{ ml: 1 }} variant="contained" onClick={integrar} disabled={files.length === 0 || merging}>Integrar</Button>
          <Button sx={{ ml: 1 }} variant="text" onClick={() => setFiles([])}>Limpar</Button>
        </Box>
      </Box>

      {merging && <LinearProgress />}

      <List>
        {files.map((f, i) => (
          <ListItem key={`${f.name}-${i}`} secondaryAction={
            <IconButton edge="end" aria-label="delete" onClick={() => removeFile(i)}>
              <DeleteIcon />
            </IconButton>
          }>
            <ListItemAvatar>
              <Avatar>
                {f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf') ? <PictureAsPdfIcon /> : <ImageIcon />}
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary={f.name} secondary={`${(f.size / 1024).toFixed(1)} KB`} />
          </ListItem>
        ))}
        {files.length === 0 && (
          <ListItem>
            <ListItemText primary="Nenhum arquivo adicionado. Arraste e solte aqui ou use 'Adicionar'." />
          </ListItem>
        )}
      </List>

      {isEditing && (
        <Paper sx={{ p: 2, mt: 2 }} elevation={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="subtitle1">Editor de Imagens (arraste e redimensione)</Typography>
            <Box>
              <Button size="small" variant="contained" sx={{ mr: 1 }} onClick={generateFinalFromEditing}>Gerar Imagem Integrada</Button>
              <Button size="small" variant="text" onClick={() => { setIsEditing(false); setEditingImages([]); }}>Cancelar</Button>
            </Box>
          </Box>
          <div id="euamopdf-editor" style={{ border: '1px solid #eee', width: '100%', overflow: 'auto' }}>
            {(() => {
              const canvasW = editingImages.length ? Math.max(...editingImages.map(i => i.x + i.width)) : 800;
              const canvasH = editingImages.length ? Math.max(...editingImages.map(i => i.y + i.height)) : 400;
              return (
                <div style={{ position: 'relative', width: canvasW, height: canvasH, minHeight: 200 }}>
                  {editingImages.map(it => (
                    <div key={it.id} style={{ position: 'absolute', left: it.x, top: it.y, width: it.width, height: it.height, boxSizing: 'border-box', border: '1px solid rgba(0,0,0,0.2)', background: '#fff' }}>
                      <img id={`edit-img-${it.id}`} src={it.src} alt={`img-${it.id}`} draggable={false} style={{ width: '100%', height: '100%', display: 'block', userSelect: 'none', pointerEvents: 'none' }} />
                      <div onMouseDown={(e) => startDrag(it.id, e as any)} style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, cursor: 'move' }} />
                      <div onMouseDown={(e) => startResize(it.id, e as any)} style={{ position: 'absolute', width: 12, height: 12, right: 0, bottom: 0, background: '#fff', border: '1px solid #666', cursor: 'nwse-resize' }} />
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </Paper>
      )}

      {previewUrl && (
        <Paper id="euamopdf-preview" sx={{ p: 2, mt: 2 }} elevation={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="subtitle1">Preview</Typography>
            <Box>
              <Button size="small" variant="contained" sx={{ mr: 1 }} onClick={() => {
                if (!previewUrl) return;
                const a = document.createElement('a');
                a.href = previewUrl;
                a.download = previewMime === 'application/pdf' ? 'integrated.pdf' : 'integrated.png';
                document.body.appendChild(a);
                a.click();
                a.remove();
              }}>Download</Button>
              <Button size="small" variant="text" onClick={() => {
                if (previewUrl) {
                  try { URL.revokeObjectURL(previewUrl); } catch (e) { /* ignore */ }
                }
                setPreviewUrl(null);
                setPreviewMime(null);
              }}>Fechar</Button>
            </Box>
          </Box>
          {previewMime === 'application/pdf' ? (
            // PDF preview
            // object is used so browsers can render the PDF inline
            // width 100% and fixed height to fit the UI
            // eslint-disable-next-line jsx-a11y/iframe-has-title
            <object data={previewUrl || undefined} type="application/pdf" width="100%" height="500px">PDF preview não disponível</object>
          ) : (
            <img src={previewUrl || undefined} alt="Preview" style={{ maxWidth: '100%', height: 'auto' }} />
          )}
        </Paper>
      )}
    </Paper>
  );
};

export default EuAmoPdf;
