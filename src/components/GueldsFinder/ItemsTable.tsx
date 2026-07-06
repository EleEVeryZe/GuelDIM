import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
    Container, Typography, Grid, Card, CardContent, CardActions,
    Button, Box, Chip, Divider, IconButton, Tooltip, CircularProgress,
    Alert, Fade, Snackbar, TextField, MenuItem, Select, FormControl,
    InputLabel, Tabs, Tab, InputAdornment, Dialog, DialogTitle,
    DialogContent, DialogActions, LinearProgress, Pagination, ImageList, ImageListItem
} from '@mui/material';
import {
    OpenInNew as OpenInNewIcon,
    VisibilityOff as VisibilityOffIcon,
    LaptopMac as LaptopIcon,
    AttachMoney as MoneyIcon,
    Autorenew as AutoRenewIcon,
    Star as StarIcon,
    StarBorder as StarBorderIcon,
    Search as SearchIcon,
    Sort as SortIcon,
    CloudDownload as DownloadIcon,
    WhatsApp as WhatsAppIcon,
    TouchApp as TouchAppIcon,
    Place as PlaceIcon,
    Send as SendIcon,
    SmartToy as SmartToyIcon,
    Chat as ChatIcon,
    ChevronRight as ChevronRightIcon,
    Memory as MemoryIcon,
    SaveOutlined as StorageIcon,
    Videocam as VideocamIcon,
    Person as PersonIcon,
    Schedule as ScheduleIcon,
    Verified as VerifiedIcon
} from '@mui/icons-material';

const API_URL = 'http://localhost:3001';
const CONTATOS_ENVIO = [{ nome: "Rafael", n: '31991631170' }];

// Helper para extrair propriedades do item
const getPropertyValue = (properties: any[], name: string): string => {
    if (!Array.isArray(properties)) return '';
    const prop = properties.find(p => p.name === name);
    return prop?.value || '';
};

// Helper para formatar HTML simples em texto
const stripHtmlTags = (html: string): string => {
    if (!html) return '';
    return html.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, '');
};

type ItemCardProps = {
    item: any;
    isTodosTab: boolean;
    onFieldChange: (id: string, field: string, value: any) => void;
    onFieldBlur: () => void;
    onNotInterested: (id: string) => void;
    onToggleHighlyInterested: (id: string) => void;
    onOpenAi: (item: any) => void;
    onOnyxLink: (item: any) => void;
    onWhatsApp: (item: any) => void;
    onSendLocation: (item: any, contato: any) => void;
};

const ItemCard = React.memo(function ItemCard({
    item,
    isTodosTab,
    onFieldChange,
    onFieldBlur,
    onNotInterested,
    onToggleHighlyInterested,
    onOpenAi,
    onOnyxLink,
    onWhatsApp,
    onSendLocation,
}: ItemCardProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const hasImages = Array.isArray(item.imagens) && item.imagens.length > 0;
    const hasSpecifications = Array.isArray(item.propriedades) && item.propriedades.length > 0;
    const ram = getPropertyValue(item.propriedades, 'info_notebooks_cpu_ram_size');
    const storage = getPropertyValue(item.propriedades, 'info_notebooks_storage_size');
    const screen = getPropertyValue(item.propriedades, 'info_notebooks_screen_inches');
    const condition = getPropertyValue(item.propriedades, 'info_notebooks_condition');
    const processor = getPropertyValue(item.propriedades, 'info_notebooks_cpu_model');

    const nextImage = () => {
        if (hasImages) {
            setCurrentImageIndex((prev) => (prev + 1) % item.imagens.length);
        }
    };

    const prevImage = () => {
        if (hasImages) {
            setCurrentImageIndex((prev) => (prev - 1 + item.imagens.length) % item.imagens.length);
        }
    };

    // Handler para separar automaticamente coordenadas ao colar
    const handleCoordinatePaste = (fieldName: string) => (e: React.ClipboardEvent<HTMLInputElement>) => {
        const pastedText = e.clipboardData.getData('text').trim();
        
        // Verifica se é um formato de coordenadas (ex: -19.932,-43.938)
        const coordPattern = /^(-?\d+\.?\d*)\s*[,\s]\s*(-?\d+\.?\d*)$/;
        const match = pastedText.match(coordPattern);
        
        if (match) {
            e.preventDefault();
            const [, lat, lng] = match;
            
            if (fieldName === 'latitude') {
                onFieldChange(item.id, 'latitude', lat);
                // Tenta preencher longitude se estiver vazia
                if (!item.longitude) {
                    onFieldChange(item.id, 'longitude', lng);
                }
            } else if (fieldName === 'longitude') {
                onFieldChange(item.id, 'longitude', lng);
                // Tenta preencher latitude se estiver vazia
                if (!item.latitude) {
                    onFieldChange(item.id, 'latitude', lat);
                }
            }
        }
    };

    return (
        <Grid item xs={12} sm={6} md={4} key={item.id}>
            <Fade in timeout={400}>
                <Card sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 4,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
                    position: 'relative',
                    border: item.muitoInteressado ? '2px solid #f59e0b' : '1px solid #e2e8f0',
                    overflow: 'hidden'
                }}>
                    {/* Seção de Imagens */}
                    {hasImages && (
                        <Box sx={{
                            position: 'relative',
                            width: '100%',
                            paddingTop: '66.67%',
                            bgcolor: '#f5f5f5',
                            overflow: 'hidden'
                        }}>
                            <Box
                                component="img"
                                src={item.imagens[currentImageIndex]}
                                sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                }}
                            />
                            {item.imagens.length > 1 && (
                                <>
                                    <IconButton
                                        onClick={prevImage}
                                        sx={{
                                            position: 'absolute',
                                            left: 4,
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            bgcolor: 'rgba(255,255,255,0.8)',
                                            '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
                                        }}
                                        size="small"
                                    >
                                        &lt;
                                    </IconButton>
                                    <IconButton
                                        onClick={nextImage}
                                        sx={{
                                            position: 'absolute',
                                            right: 4,
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            bgcolor: 'rgba(255,255,255,0.8)',
                                            '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
                                        }}
                                        size="small"
                                    >
                                        &gt;
                                    </IconButton>
                                    <Box sx={{
                                        position: 'absolute',
                                        bottom: 8,
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        bgcolor: 'rgba(0,0,0,0.6)',
                                        color: 'white',
                                        px: 1.5,
                                        py: 0.5,
                                        borderRadius: 2,
                                        fontSize: '0.75rem',
                                        fontWeight: 'bold'
                                    }}>
                                        {currentImageIndex + 1} / {item.imagens.length}
                                    </Box>
                                </>
                            )}
                        </Box>
                    )}

                    <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                        {/* Status e Metadata */}
                        <Box display="flex" justifyContent="space-between" mb={2} alignItems="center" gap={1} flexWrap="wrap">
                            <Chip
                                label={item.muitoInteressado ? "⭐ Prioridade" : "✓ Disponível"}
                                size="small"
                                color={item.muitoInteressado ? "warning" : "success"}
                                variant="outlined"
                            />

                            <Chip
                                icon={<TouchAppIcon style={{ fontSize: 16 }} />}
                                label={`Visto: ${item.cliques || 0}x`}
                                size="small"
                                variant="outlined"
                                color={item.cliques > 0 ? "primary" : "default"}
                            />

                            {item.dtVarredura && (
                                <Chip
                                    icon={<ScheduleIcon style={{ fontSize: 14 }} />}
                                    label={new Date(item.dtVarredura).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })}
                                    size="small"
                                    variant="outlined"
                                />
                            )}
                        </Box>

                        {/* Título */}
                        <Typography variant="h6" component="h2" fontWeight="700" gutterBottom sx={{ minHeight: 'auto', lineHeight: 1.3 }}>
                            {item.titulo}
                        </Typography>

                        {/* Preço */}
                        <Divider sx={{ my: 1 }} />
                        <Box display="flex" alignItems="center" color="primary.main" mb={1.5}>
                            <MoneyIcon sx={{ mr: 1 }} />
                            <Typography variant="h5" fontWeight="800">
                                {item.precoBruto}
                            </Typography>
                        </Box>

                        {/* Especificações em Chips */}
                        {hasSpecifications && (
                            <Box display="flex" gap={0.5} mb={1.5} flexWrap="wrap">
                                {ram && (
                                    <Chip
                                        icon={<MemoryIcon style={{ fontSize: 16 }} />}
                                        label={ram}
                                        size="small"
                                        variant="outlined"
                                        sx={{ fontSize: '0.75rem' }}
                                    />
                                )}
                                {storage && (
                                    <Chip
                                        icon={<StorageIcon style={{ fontSize: 16 }} />}
                                        label={storage}
                                        size="small"
                                        variant="outlined"
                                        sx={{ fontSize: '0.75rem' }}
                                    />
                                )}
                                {screen && (
                                    <Chip
                                        icon={<VideocamIcon style={{ fontSize: 16 }} />}
                                        label={screen}
                                        size="small"
                                        variant="outlined"
                                        sx={{ fontSize: '0.75rem' }}
                                    />
                                )}
                                {condition && (
                                    <Chip
                                        icon={<VerifiedIcon style={{ fontSize: 16 }} />}
                                        label={condition}
                                        size="small"
                                        color={condition.includes('Excelente') ? 'success' : 'default'}
                                        variant="outlined"
                                        sx={{ fontSize: '0.75rem' }}
                                    />
                                )}
                            </Box>
                        )}

                        {/* Processador */}
                        {processor && (
                            <Box mb={1.5} p={1} bgcolor="#f0f4ff" borderRadius={2}>
                                <Typography variant="caption" fontWeight="600" color="primary">
                                    🔧 {processor}
                                </Typography>
                            </Box>
                        )}

                        {/* Localização */}
                        {item.localizacao && (
                            <Box display="flex" alignItems="flex-start" gap={1} mb={1.5} p={1} bgcolor="#f5f5f5" borderRadius={2}>
                                <PlaceIcon sx={{ fontSize: 16, mt: 0.3, flexShrink: 0, color: 'error.main' }} />
                                <Box>
                                    <Typography variant="caption" fontWeight="600" display="block">
                                        {item.localizacao.municipio || item.localizacao.regiao}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {item.localizacao.bairro && `${item.localizacao.bairro} • `}
                                        {item.localizacao.estado}
                                    </Typography>
                                </Box>
                            </Box>
                        )}

                        {/* Vendedor */}
                        {item.vendedor && (
                            <Box display="flex" alignItems="center" gap={1} mb={1.5} p={1} bgcolor="#e8f5e9" borderRadius={2}>
                                <PersonIcon sx={{ fontSize: 16, color: 'success.main' }} />
                                <Box>
                                    <Typography variant="caption" fontWeight="600" display="block">
                                        {item.vendedor.nome}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {item.vendedor.contaProfissional ? '✓ Conta Profissional' : 'Conta Pessoal'} • {item.vendedor.chatAtivo ? '🟢 Online' : '🔴 Offline'}
                                    </Typography>
                                </Box>
                            </Box>
                        )}

                        {/* Descrição resumida */}
                        {item.descricaoDetalhada && (
                            <Tooltip 
                                title={stripHtmlTags(item.descricaoDetalhada)} 
                                arrow 
                                slotProps={{
                                    tooltip: {
                                        sx: {
                                            fontSize: '0.75rem',
                                            maxWidth: 300,
                                            whiteSpace: 'pre-wrap',
                                            wordWrap: 'break-word',
                                            bgcolor: 'rgba(0, 0, 0, 0.87)',
                                            padding: '8px 12px',
                                            borderRadius: '4px'
                                        }
                                    }
                                }}
                            >
                                <Box mb={1.5} p={1} bgcolor="#fffbf0" borderRadius={2} sx={{ borderLeft: '3px solid #ff9800', cursor: 'help' }}>
                                    <Typography variant="caption" component="div" sx={{
                                        whiteSpace: 'pre-line',
                                        maxHeight: 80,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        color: '#666'
                                    }}>
                                        {stripHtmlTags(item.descricaoDetalhada).split('\n').slice(0, 3).join('\n')}...
                                    </Typography>
                                </Box>
                            </Tooltip>
                        )}

                        {/* Campos editáveis - Localização */}
                        <Grid container spacing={1} mb={1.5}>
                            <Grid item xs={6}>
                                <TextField
                                    label="Latitude"
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    placeholder="Ex: -19.932"
                                    value={item.latitude || ''}
                                    onChange={(e) => onFieldChange(item.id, 'latitude', e.target.value)}
                                    onPaste={handleCoordinatePaste('latitude')}
                                    onBlur={onFieldBlur}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    label="Longitude"
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    placeholder="Ex: -43.938"
                                    value={item.longitude || ''}
                                    onChange={(e) => onFieldChange(item.id, 'longitude', e.target.value)}
                                    onPaste={handleCoordinatePaste('longitude')}
                                    onBlur={onFieldBlur}
                                />
                            </Grid>
                        </Grid>

                        {/* Botão Enviar para Buscar */}
                        <Box mb={2}>
                            <Button
                                fullWidth
                                variant="outlined"
                                color="success"
                                size="small"
                                startIcon={<SendIcon />}
                                onClick={() => onSendLocation(item, CONTATOS_ENVIO[0])}
                                sx={{
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    fontWeight: '600',
                                    borderColor: '#2e7d32',
                                    '&:hover': { bgcolor: '#f1f8e9', borderColor: '#1b5e20' }
                                }}
                            >
                                Enviar p/ Buscar (WhatsApp)
                            </Button>
                        </Box>

                        {/* Campos editáveis de contato e notas */}
                        <>
                            <Box display="flex" gap={1} mb={1.5} alignItems="center">
                                <TextField
                                    label="Telefone"
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    value={item.telefone || ''}
                                    onChange={(e) => onFieldChange(item.id, 'telefone', e.target.value)}
                                    onBlur={onFieldBlur}
                                />
                                {item.telefone && item.telefone.trim().length >= 8 && (
                                    <Tooltip title="WhatsApp">
                                        <IconButton
                                            color="success"
                                            onClick={() => onWhatsApp(item)}
                                            size="small"
                                            sx={{ bgcolor: '#e8f5e9', '&:hover': { bgcolor: '#c8e6c9' } }}
                                        >
                                            <WhatsAppIcon />
                                        </IconButton>
                                    </Tooltip>
                                )}
                            </Box>

                            <TextField
                                label="Anotações"
                                variant="outlined"
                                size="small"
                                fullWidth
                                multiline
                                rows={2}
                                placeholder="Anotações pessoais..."
                                value={item.observacoes || ''}
                                onChange={(e) => onFieldChange(item.id, 'observacoes', e.target.value)}
                                onBlur={onFieldBlur}
                                sx={{ mb: 1.5 }}
                            />
                        </>

                        {item.justificativa && (
                            <Alert severity="info" sx={{ fontSize: '0.75rem', py: 1 }}>
                                {item.justificativa}
                            </Alert>
                        )}
                    </CardContent>

                    <CardActions sx={{ p: 2, pt: 0, justifyContent: 'space-between' }}>
                        <Box display="flex" gap={0.5}>
                            <Tooltip title="Não Interessado">
                                <IconButton color="error" onClick={() => onNotInterested(item.id)} size="small">
                                    <VisibilityOffIcon />
                                </IconButton>
                            </Tooltip>

                            <Tooltip title={item.muitoInteressado ? "Remover dos Favoritos" : "Favoritar"}>
                                <IconButton
                                    onClick={() => onToggleHighlyInterested(item.id)}
                                    sx={{ color: item.muitoInteressado ? '#f59e0b' : 'text.disabled' }}
                                    size="small"
                                >
                                    {item.muitoInteressado ? <StarIcon /> : <StarBorderIcon />}
                                </IconButton>
                            </Tooltip>

                            <Tooltip title="Perguntar à IA">
                                <IconButton
                                    color="info"
                                    onClick={() => onOpenAi(item)}
                                    size="small"
                                    sx={{ bgcolor: '#e0f2fe', '&:hover': { bgcolor: '#bae6fd' } }}
                                >
                                    <SmartToyIcon />
                                </IconButton>
                            </Tooltip>
                        </Box>

                        <Button
                            variant={item.muitoInteressado ? "contained" : "outlined"}
                            color={item.muitoInteressado ? "warning" : "primary"}
                            endIcon={<OpenInNewIcon />}
                            onClick={() => onOnyxLink(item)}
                            size="small"
                            sx={{ borderRadius: 2 }}
                        >
                            OLX
                        </Button>
                    </CardActions>
                </Card>
            </Fade>
        </Grid>
    );
}, (prev, next) => prev.item === next.item && prev.isTodosTab === next.isTodosTab);

export default function ItemsTable() {
    const [items, setItems] = useState([]);
    const [todos, setTodos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [todosLoading, setTodosLoading] = useState(false);
    const [todosPage, setTodosPage] = useState(1);
    const TODOS_PAGE_SIZE = 100;
    const [filterLoading, setFilterLoading] = useState(false);
    const [debouncedFilterText, setDebouncedFilterText] = useState('');
    const [debouncedFilterId, setDebouncedFilterId] = useState('');
    const [debouncedMinPrice, setDebouncedMinPrice] = useState('');
    const [debouncedMaxPrice, setDebouncedMaxPrice] = useState('');
    const [triggerLoading, setTriggerLoading] = useState(false);
    const [error, setError] = useState(null);
    const [todosError, setTodosError] = useState<string | null>(null);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'info' | 'warning' | 'error' }>({ open: false, message: '', severity: 'success' });
    const isFirstFilterEffect = useRef(true);

    // Estados de Controle
    const [tabIndex, setTabIndex] = useState(0);
    const [filterText, setFilterText] = useState('');
    const [filterId, setFilterId] = useState('');
    const [sortBy, setSortBy] = useState('none');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const isTodosTab = tabIndex === 2;

    // Estados da Integração com a IA
    const [openAiDialog, setOpenAiDialog] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [aiLoading, setAiLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (tabIndex === 2 && todos.length === 0 && !todosLoading) {
            fetchTodos();
        }
    }, [tabIndex]);

    useEffect(() => {
        if (isFirstFilterEffect.current) {
            isFirstFilterEffect.current = false;
            setDebouncedFilterText(filterText);
            setDebouncedFilterId(filterId);
            setDebouncedMinPrice(minPrice);
            setDebouncedMaxPrice(maxPrice);
            return;
        }

        setFilterLoading(true);
        const timer = window.setTimeout(() => {
            setDebouncedFilterText(filterText);
            setDebouncedFilterId(filterId);
            setDebouncedMinPrice(minPrice);
            setDebouncedMaxPrice(maxPrice);
            setTodosPage(1);
            setFilterLoading(false);
        }, 400);

        return () => window.clearTimeout(timer);
    }, [filterText, filterId, minPrice, maxPrice]);

    const handleTabChange = useCallback((event, newValue) => {
        setTabIndex(newValue);
        if (newValue === 2 && todos.length === 0 && !todosLoading) {
            fetchTodos();
        }
        if (newValue !== 2) {
            setTodosPage(1);
        }
    }, [todos.length, todosLoading]);

    const fetchData = async () => {
        try {
            const res = await fetch(`${API_URL}/download`);
            if (!res.ok) throw new Error('Falha ao carregar dados');
            const data = await res.json();
            setItems(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchTodos = async () => {
        setTodosLoading(true);
        setTodosError(null);
        try {
            const res = await fetch(`${API_URL}/todos`);
            if (!res.ok) throw new Error('Falha ao carregar todos');
            const data = await res.json();
            setTodos(Array.isArray(data) ? data : []);
        } catch (err) {
            setTodosError(err.message);
        } finally {
            setTodosLoading(false);
        }
    };

    const syncWithBackend = useCallback(async (updatedList) => {
        try {
            await fetch(`${API_URL}/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedList),
            });
        } catch (err) {
            console.error("Erro ao sincronizar com o servidor:", err);
            showToast('Erro ao salvar dados no backend.', 'error');
        }
    }, []);

    const updateCurrentList = useCallback(async (updatedList, options = { sync: true }) => {
        if (isTodosTab) {
            setTodos(updatedList);
        } else {
            setItems(updatedList);
            if (options.sync) {
                await syncWithBackend(updatedList);
            }
        }
    }, [isTodosTab, syncWithBackend]);

    const handleFieldBlur = useCallback(() => {
        if (!isTodosTab) {
            syncWithBackend(items);
        }
    }, [isTodosTab, items, syncWithBackend]);

    const showToast = useCallback((message: string, severity: 'success' | 'info' | 'warning' | 'error' = 'success') => {
        setSnackbar({ open: true, message, severity });
    }, []);

    // Função adaptada para realizar a chamada à API do DeepSeek direto do Front
    const handleAskAI = async () => {
        if (!aiPrompt.trim() && !aiResponse) return;
        setAiLoading(true);
        setAiResponse('');

        const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

        // Extrai especificações do item
        const specs = selectedItem?.propriedades ? {
            processor: getPropertyValue(selectedItem.propriedades, 'info_notebooks_cpu_model'),
            ram: getPropertyValue(selectedItem.propriedades, 'info_notebooks_cpu_ram_size'),
            storage: getPropertyValue(selectedItem.propriedades, 'info_notebooks_storage_size'),
            screen: getPropertyValue(selectedItem.propriedades, 'info_notebooks_screen_inches'),
            condition: getPropertyValue(selectedItem.propriedades, 'info_notebooks_condition'),
        } : {};

        // Contexto rico sobre o notebook atual para a IA não se perder
        const contextPrompt = `Você é um especialista em hardware de computadores. O usuário tem dúvidas sobre o seguinte anúncio de notebook usado:

Notebook: "${selectedItem?.titulo}"
Preço: ${selectedItem?.precoBruto}
Processador: ${specs.processor || 'Não informado'}
Memória RAM: ${specs.ram || 'Não informado'}
Armazenamento: ${specs.storage || 'Não informado'}
Tela: ${specs.screen || 'Não informado'}
Condição: ${specs.condition || 'Não informado'}
Vendedor: ${selectedItem?.vendedor?.nome || 'Desconhecido'} ${selectedItem?.vendedor?.contaProfissional ? '(Profissional)' : ''}
Localização: ${selectedItem?.localizacao?.municipio || 'Não informada'}

Descrição do anúncio:
${selectedItem?.descricaoDetalhada ? stripHtmlTags(selectedItem.descricaoDetalhada).substring(0, 500) : 'N/A'}

Anotações do usuário: "${selectedItem?.observacoes || 'Nenhuma'}"

Pergunta do usuário: ${aiPrompt || 'Faça uma análise geral se este notebook vale a pena pelo preço anunciado e aponte possíveis gargalos ou pontos fortes.'}`;

        try {
            const response = await fetch(DEEPSEEK_API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer sk-2a4144829a9946fc9d01b0e8be0bf98d`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'deepseek-chat',
                    messages: [{ role: 'user', content: contextPrompt }],
                    temperature: 0.3,
                }),
            });

            if (!response.ok) throw new Error('Falha na API do DeepSeek');

            const data = await response.json();
            setAiResponse(data?.choices?.[0]?.message?.content || 'Sem resposta da IA.');
        } catch (err) {
            console.error(err);
            setAiResponse('Erro ao conectar com a IA. Verifique sua chave de API ou conexão.');
        } finally {
            setAiLoading(false);
        }
    };

    const handleOpenAiModal = useCallback((item) => {
        setSelectedItem(item);
        setAiPrompt('');
        setAiResponse('');
        setOpenAiDialog(true);
    }, []);

    const handleNotInterested = useCallback(async (id) => {
        if (isTodosTab) {
            setTodos(prev => prev.map(item => item.id === id ? { ...item, interessado: false } : item));
        } else {
            setItems(prev => prev.map(item => item.id === id ? { ...item, interessado: false } : item));
        }
        showToast('Item removido da sua lista.');
    }, [isTodosTab, showToast]);

    const handleToggleHighlyInterested = useCallback(async (id) => {
        if (isTodosTab) {
            let nextValue = false;
            setTodos(prev => prev.map(item => {
                if (item.id === id) {
                    nextValue = !item.muitoInteressado;
                    return { ...item, muitoInteressado: nextValue };
                }
                return item;
            }));
            showToast(nextValue ? 'Adicionado aos Favoritos ★' : 'Removido dos Favoritos');
        } else {
            let nextValue = false;
            setItems(prev => {
                const updated = prev.map(item => {
                    if (item.id === id) {
                        nextValue = !item.muitoInteressado;
                        return { ...item, muitoInteressado: nextValue };
                    }
                    return item;
                });
                syncWithBackend(updated);
                return updated;
            });
            showToast(nextValue ? 'Adicionado aos Favoritos ★' : 'Removido dos Favoritos');
        }
    }, [isTodosTab, showToast, syncWithBackend]);

    const handleLocalFieldChange = useCallback((id, field, value) => {
        if (isTodosTab) {
            setTodos(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
        } else {
            setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
        }
    }, [isTodosTab]);

    const handleOnyxLinkClick = useCallback(async (item) => {
        const CliquesAtuais = Number(item.cliques || 0) + 1;

        if (isTodosTab) {
            setTodos(prev => prev.map(i => i.id === item.id ? { ...i, cliques: CliquesAtuais } : i));
        } else {
            setItems(prev => {
                const updated = prev.map(i => i.id === item.id ? { ...i, cliques: CliquesAtuais } : i);
                syncWithBackend(updated);
                return updated;
            });
        }

        // Extrai especificações para compor mensagem de abordagem
        const specs = item.propriedades ? [
            getPropertyValue(item.propriedades, 'info_notebooks_cpu_model'),
            getPropertyValue(item.propriedades, 'info_notebooks_cpu_ram_size'),
            getPropertyValue(item.propriedades, 'info_notebooks_storage_size'),
        ].filter(Boolean).join(' • ') : '';

        const mensagemVendedor = `Olá! Tenho interesse no notebook "${item.titulo}". ${specs ? `(${specs})` : ''} O equipamento ainda está disponível? ${item.ofertaIdeal ? `Aceita R$ ${item.ofertaIdeal}?` : ''}`;

        try {
            await navigator.clipboard.writeText(mensagemVendedor);
            showToast('Mensagem copiada! Ctrl+V no chat do OLX. 💬', 'success');
        } catch (err) {
            console.error('Falha ao copiar mensagem:', err);
        }

        // Se houver link direto, abre; caso contrário, usa o ID
        if (item.link) {
            window.open(item.link, '_blank', 'noopener,noreferrer');
        } else {
            window.open('https://chat.olx.com.br/?list-id=' + item.id, '_blank', 'noopener,noreferrer');
        }
    }, [isTodosTab, showToast, syncWithBackend]);

    const handleWhatsAppClick = useCallback((item) => {
        if (!item.telefone) return;
        const apenasNumeros = item.telefone.replace(/\D/g, '');
        const telefoneFormatado = apenasNumeros.startsWith('55') ? apenasNumeros : `55${apenasNumeros}`;
        const textoWhats = `Olá! Vi o anuncio "${item.link}". Gostaria de saber o estado dele e se eu posso ver o equipamento pessoalmente?`;
        const urlWhats = `https://api.whatsapp.com/send?phone=${telefoneFormatado}&text=${encodeURIComponent(textoWhats)}`;
        window.open(urlWhats, '_blank', 'noopener,noreferrer');
    }, []);

    const handleSendLocationToContact = useCallback((item, contato) => {
        const endereco = item.endereco || 'Não informado';
        const lat = item.latitude || 'Não informada';
        const lng = item.longitude || 'Não informada';
        let textoWaze = '';
        if (lat && lng) {
            textoWaze = `\n🚗 Abrir no Waze: https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
        }

        let textoTelefoneWhats = '';
        if (item.telefone) {
            const apenasNumerosItem = item.telefone.replace(/\D/g, '');
            const telefoneItemFormatado = apenasNumerosItem.startsWith('55') ? apenasNumerosItem : `55${apenasNumerosItem}`;
            const mensagemOlx = `Olá, estávamos conversando na OLX sobre o anúncio ${item.link}, gostaria de combinar um horário para ver o equipamento e se possivel me enviar um video do equipamento`;
            const urlWhatsItem = `https://api.whatsapp.com/send?phone=${telefoneItemFormatado}&text=${encodeURIComponent(mensagemOlx)}`;
            textoTelefoneWhats = `\n*Falar no WhatsApp:* ${urlWhatsItem}`;
        }

        const mensagem = `*Localização do Notebook:* ${item.titulo}\n\n🏠 *Endereço:* ${endereco}\n🌐 *Coordenadas:* ${lat}, ${lng}${textoWaze}${textoTelefoneWhats}\n🔗 *Link do Anúncio:* ${item.link}`;
        const apenasNumeros = contato.n.replace(/\D/g, '');
        const telefoneFormatado = apenasNumeros.startsWith('55') ? apenasNumeros : `55${apenasNumeros}`;
        const urlWhats = `https://api.whatsapp.com/send?phone=${telefoneFormatado}&text=${encodeURIComponent(mensagem)}`;
        window.open(urlWhats, '_blank', 'noopener,noreferrer');
    }, []);

    const handleTriggerProcess = async () => {
        setTriggerLoading(true);
        try {
            const res = await fetch(`${API_URL}/trigger`, { method: 'POST' });
            if (!res.ok) throw new Error('Erro no servidor.');
            const result = await res.json();
            showToast(result.mensagem || 'Processamento concluído!', 'success');
            await fetchData();
        } catch (err) {
            showToast('Falha ao rodar o processamento.', 'error');
        } finally {
            setTriggerLoading(false);
        }
    };

    const handleExportCSVAndCopyPrompt = async () => {
        if (processedItems.length === 0) {
            showToast('Não há itens na listagem atual para exportar.', 'warning');
            return;
        }

        const headers = ['id', 'titulo', 'preco_limpo', 'preco_bruto', 'link', 'endereco', 'latitude', 'longitude', 'observacoes', 'telefone', 'cliques'];
        const csvRows = processedItems.map(item => {
            const id = item.id;
            const titulo = `"${item.titulo.replace(/"/g, '""')}"`;
            const precoLimpo = item.precoLimpo2 || item.precoLimpo;
            const precoBruto = `"${item.precoBruto}"`;
            const link = item.link;
            const endereco = `"${(item.endereco || '').replace(/"/g, '""')}"`;
            const latitude = item.latitude || '';
            const longitude = item.longitude || '';
            const obs = `"${(item.observacoes || '').replace(/"/g, '""')}"`;
            const tel = item.telefone || '';
            const cliq = item.cliques || 0;

            return [id, titulo, precoLimpo, precoBruto, link, endereco, latitude, longitude, obs, tel, cliq].join(',');
        });

        const csvContent = [headers.join(','), ...csvRows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', url);
        linkElement.setAttribute('download', `notebooks_para_analise_ia.csv`);
        linkElement.style.visibility = 'hidden';
        document.body.appendChild(linkElement);
        linkElement.click();
        document.body.removeChild(linkElement);

        const promptTexto = `Analise este arquivo CSV anexado contendo anúncios de notebooks extraídos do OLX. 

Com base nas especificações técnicas que você conseguir identificar diretamente nos títulos (como geração do processador Intel/AMD, quantidade de memória RAM, presença de SSD e estado do produto) cruzando com os preços limpos e brutos fornecidos:

1. Classifique e liste quais são as 3 IDs que apresentam o melhor custo-benefício real (as que mais compensa comprar).
2. Justifique detalhadamente o motivo da escolha de cada uma delas, apontando os pontos fortes detectados.
3. Se houver alguma ID que pareça um golpe claro ou valor absurdamente fora da realidade (ex: preço baixo demais para a configuração), me alerte.

${csvContent}
`;

        try {
            await navigator.clipboard.writeText(promptTexto);
            showToast('CSV baixado e Prompt copiado! Só anexar e dar Ctrl+V na IA. 🤖', 'success');
        } catch (err) {
            showToast('CSV baixado, mas falhou ao copiar o prompt.', 'warning');
        }
    };

    const activeItems = useMemo(() => (isTodosTab ? todos : items), [isTodosTab, todos, items]);

    const processedItems = useMemo(() => {
        const filtered = activeItems.filter(item => {
            const matchesNome = String(item.titulo || '').toLowerCase().includes(debouncedFilterText.toLowerCase());
            const matchesId = String(item.id || '').includes(debouncedFilterId);
            const itemPrice = Number(item.precoLimpo2 || item.precoLimpo || 0);
            const matchesMinPrice = debouncedMinPrice === '' || itemPrice >= Number(debouncedMinPrice);
            const matchesMaxPrice = debouncedMaxPrice === '' || itemPrice <= Number(debouncedMaxPrice);

            if (isTodosTab) {
                return matchesNome && matchesId && matchesMinPrice && matchesMaxPrice;
            }

            const matchesInteresse = item.interessado !== false;
            const matchesTab = tabIndex === 1 ? !!item.muitoInteressado : !item.muitoInteressado;
            return matchesInteresse && matchesNome && matchesId && matchesTab && matchesMinPrice && matchesMaxPrice;
        });

        if (sortBy === 'asc') {
            return [...filtered].sort((a, b) => (Number(a.precoLimpo2) || Number(a.precoLimpo) || 0) - (Number(b.precoLimpo2) || Number(b.precoLimpo) || 0));
        }

        if (sortBy === 'desc') {
            return [...filtered].sort((a, b) => (Number(b.precoLimpo2) || Number(b.precoLimpo) || 0) - (Number(a.precoLimpo2) || Number(a.precoLimpo) || 0));
        }

        return filtered;
    }, [activeItems, debouncedFilterText, debouncedFilterId, debouncedMinPrice, debouncedMaxPrice, isTodosTab, sortBy, tabIndex]);

    const totalTodosPages = useMemo(() => isTodosTab ? Math.max(1, Math.ceil(processedItems.length / TODOS_PAGE_SIZE)) : 1, [isTodosTab, processedItems.length]);
    const displayedItems = useMemo(() => isTodosTab ? processedItems.slice((todosPage - 1) * TODOS_PAGE_SIZE, todosPage * TODOS_PAGE_SIZE) : processedItems, [isTodosTab, processedItems, todosPage]);

    useEffect(() => {
        if (isTodosTab && todosPage > totalTodosPages) {
            setTodosPage(totalTodosPages);
        }
    }, [isTodosTab, todosPage, totalTodosPages]);

    if (loading || (isTodosTab && todosLoading)) return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
            <CircularProgress size={60} thickness={4} />
        </Box>
    );

    return (
        <Container maxWidth="lg" sx={{ py: 6 }}>

            {/* Cabeçalho */}
            <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" mb={4} gap={2}>
                <Box textAlign={{ xs: 'center', md: 'left' }}>
                    <Typography variant="h3" fontWeight="800" color="primary" gutterBottom>
                        <LaptopIcon sx={{ fontSize: 45, mr: 2, verticalAlign: 'middle' }} />
                        {isTodosTab ? 'Todos' : 'Curadoria de Notebooks'}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ fontWeight: '500', mt: 1 }}>
                        Exibindo <span style={{ color: '#1976d2', fontWeight: 'bold' }}>{displayedItems.length}</span> de <span style={{ fontWeight: 'bold' }}>{isTodosTab ? processedItems.length : items.filter(i => i.interessado !== false).length}</span> {isTodosTab ? 'registros filtrados do todos.json' : 'notebooks ativos na base geral'}.
                    </Typography>
                </Box>

                <Box display="flex" gap={2} flexDirection={{ xs: 'column', sm: 'row' }} width={{ xs: '100%', md: 'auto' }}>
                    <Button
                        variant="contained"
                        color="info"
                        startIcon={<DownloadIcon />}
                        onClick={handleExportCSVAndCopyPrompt}
                        sx={{ borderRadius: 3, fontWeight: 'bold', px: 3 }}
                    >
                        Exportar para IA (CSV + Prompt)
                    </Button>

                    <Button
                        variant="contained"
                        color="secondary"
                        startIcon={triggerLoading ? <CircularProgress size={20} color="inherit" /> : <AutoRenewIcon />}
                        disabled={triggerLoading}
                        onClick={handleTriggerProcess}
                        sx={{ borderRadius: 3, fontWeight: 'bold', px: 3 }}
                    >
                        {triggerLoading ? 'Processando...' : 'Processar Dados'}
                    </Button>
                </Box>
            </Box>

            {/* Filtros */}
            <Box sx={{ p: 3, mb: 4, borderRadius: 4, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={3}>
                        <TextField
                            fullWidth
                            label="Buscar por Nome"
                            variant="outlined"
                            size="small"
                            value={filterText}
                            onChange={(e) => setFilterText(e.target.value)}
                            InputProps={{ startAdornment: <SearchIcon sx={{ color: 'text.disabled', mr: 1 }} /> }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                        <TextField
                            fullWidth
                            label="Filtrar por ID"
                            variant="outlined"
                            size="small"
                            value={filterId}
                            onChange={(e) => setFilterId(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={6} sm={2}>
                        <TextField
                            fullWidth
                            label="Preço Mín (R$)"
                            type="number"
                            variant="outlined"
                            size="small"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={6} sm={2}>
                        <TextField
                            fullWidth
                            label="Preço Máx (R$)"
                            type="number"
                            variant="outlined"
                            size="small"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Ordenar por Preço</InputLabel>
                            <Select
                                value={sortBy}
                                label="Ordenar por Preço"
                                onChange={(e) => setSortBy(e.target.value)}
                                startAdornment={<SortIcon sx={{ color: 'text.disabled', mr: 1 }} />}
                            >
                                <MenuItem value="none">Sem ordenação</MenuItem>
                                <MenuItem value="asc">Menor Preço primeiro</MenuItem>
                                <MenuItem value="desc">Maior Preço primeiro</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Box>
            {filterLoading && (
                <Box sx={{ mb: 2 }}>
                    <LinearProgress />
                </Box>
            )}

            {/* Abas */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
                <Tabs value={tabIndex} onChange={handleTabChange} color="primary">
                    <Tab label={`Interessados (${items.filter(i => i.interessado !== false && !i.muitoInteressado).length})`} />
                    <Tab
                        icon={<StarIcon sx={{ color: '#f59e0b' }} />}
                        iconPosition="start"
                        label={`Muito Interessado (${items.filter(i => i.interessado !== false && i.muitoInteressado).length})`}
                    />
                    <Tab label={`Todos (${todos.length})`} />
                </Tabs>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}
            {todosError && isTodosTab && <Alert severity="error" sx={{ mb: 4 }}>{todosError}</Alert>}

            {/* Grid de Cards */}
            {processedItems.length === 0 ? (
                <Alert severity="info" variant="outlined" sx={{ borderRadius: 4 }}>
                    Nenhum notebook corresponde aos critérios ou à aba selecionada.
                </Alert>
            ) : (
                <>
                    <Grid container spacing={3}>
                    {displayedItems.map((item) => (
                        <ItemCard
                            key={item.id}
                            item={item}
                            isTodosTab={isTodosTab}
                            onFieldChange={handleLocalFieldChange}
                            onFieldBlur={handleFieldBlur}
                            onNotInterested={handleNotInterested}
                            onToggleHighlyInterested={handleToggleHighlyInterested}
                            onOpenAi={handleOpenAiModal}
                            onOnyxLink={handleOnyxLinkClick}
                            onWhatsApp={handleWhatsAppClick}
                            onSendLocation={handleSendLocationToContact}
                        />
                    ))}
                </Grid>
                {isTodosTab && totalTodosPages > 1 && (
                    <Box display="flex" justifyContent="center" mt={4}>
                        <Pagination
                            count={totalTodosPages}
                            page={todosPage}
                            onChange={(event, value) => setTodosPage(value)}
                            color="primary"
                            showFirstButton
                            showLastButton
                        />
                    </Box>
                )}
            </>
            )}

            {/* MODAL DE CONSULTA DA IA (DIALÓGO) */}
            <Dialog
                open={openAiDialog}
                onClose={() => setOpenAiDialog(false)}
                fullWidth
                maxWidth="sm"
                sx={{ '& .MuiDialog-paper': { borderRadius: 4 } }}
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'bold' }}>
                    <SmartToyIcon color="primary" /> Tirar Dúvidas com IA
                </DialogTitle>
                <DialogContent dividers>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Anúncio selecionado:
                    </Typography>
                    <Typography variant="body1" fontWeight="700" color="primary" gutterBottom>
                        {selectedItem?.titulo} ({selectedItem?.precoBruto})
                    </Typography>

                    <Box sx={{ mt: 3, mb: 2 }}>
                        <TextField
                            fullWidth
                            label="O que você quer saber sobre este notebook?"
                            placeholder="Ex: Esse processador é bom para desenvolvimento? O preço está justo? Roda jogos leves?"
                            multiline
                            rows={3}
                            variant="outlined"
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                        />
                    </Box>

                    {aiLoading && (
                        <Box display="flex" justifyContent="center" my={2} alignItems="center" gap={1}>
                            <CircularProgress size={24} />
                            <Typography variant="body2" color="text.secondary">Processando análise com DeepSeek...</Typography>
                        </Box>
                    )}

                    {aiResponse && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: '#f0fdf4', borderRadius: 3, border: '1px solid #bbf7d0' }}>
                            <Typography variant="subtitle2" fontWeight="bold" color="success.main" display="flex" alignItems="center" gap={1} mb={1}>
                                <ChatIcon fontSize="small" /> Análise da IA:
                            </Typography>
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-line', color: '#1e293b', lineHeight: 1.6 }}>
                                {aiResponse}
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2.5 }}>
                    <Button onClick={() => setOpenAiDialog(false)} color="inherit">
                        Fechar
                    </Button>
                    <Button
                        onClick={handleAskAI}
                        variant="contained"
                        color="primary"
                        disabled={aiLoading}
                        startIcon={aiLoading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                    >
                        {aiPrompt ? 'Perguntar' : 'Análise Geral'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>

        </Container>
    );
}