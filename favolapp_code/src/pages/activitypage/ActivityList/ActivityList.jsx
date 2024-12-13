import { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Avatar from '@mui/material/Avatar';
import {
  IconButton,
  Drawer,
  Typography,
  Grid,
  CardContent,
  useMediaQuery,
  Stack,
  FormControl,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import './ActivityList.css';
import PropTypes from 'prop-types';
import { getUrl } from 'aws-amplify/storage';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const localeText = {
  noRowsLabel: 'Nessuna riga',
  noResultsOverlayLabel: 'Nessun risultato trovato.',
  errorOverlayDefaultLabel: 'Si è verificato un errore.',
  toolbarDensity: 'Densità',
  toolbarDensityLabel: 'Densità',
  toolbarDensityCompact: 'Compatta',
  toolbarDensityStandard: 'Standard',
  toolbarDensityComfortable: 'Comoda',
  toolbarColumns: 'Colonne',
  toolbarColumnsLabel: 'Gestisci colonne',
  toolbarFilters: 'Filtri',
  toolbarFiltersLabel: 'Mostra filtri',
  toolbarFiltersTooltipHide: 'Nascondi filtri',
  toolbarFiltersTooltipShow: 'Mostra filtri',
  toolbarFiltersTooltipActive: (count) =>
    count !== 1 ? `${count} filtri attivi` : `${count} filtro attivo`,
  toolbarQuickFilterPlaceholder: 'Cerca…',
  toolbarQuickFilterLabel: 'Cerca',
  toolbarExport: 'Esporta',
  toolbarExportLabel: 'Esporta',
  toolbarExportCSV: 'Scarica come CSV',
  toolbarExportPrint: 'Stampa',
  columnsPanelTextFieldLabel: 'Trova colonna',
  columnsPanelTextFieldPlaceholder: 'Titolo colonna',
  columnsPanelDragIconLabel: 'Riordina colonna',
  columnsPanelShowAllButton: 'Mostra tutto',
  columnsPanelHideAllButton: 'Nascondi tutto',
  filterPanelAddFilter: 'Aggiungi filtro',
  filterPanelRemoveAll: 'Rimuovi tutti',
  filterPanelDeleteIconLabel: 'Elimina',
  filterPanelLogicOperator: 'Operatore logico',
  filterPanelOperator: 'Operatore',
  filterPanelOperatorAnd: 'E',
  filterPanelOperatorOr: 'O',
  filterPanelColumns: 'Colonne',
  filterPanelInputLabel: 'Valore',
  filterPanelInputPlaceholder: 'Valore filtro',
  filterOperatorContains: 'contiene',
  filterOperatorEquals: 'uguale a',
  filterOperatorStartsWith: 'inizia con',
  filterOperatorEndsWith: 'finisce con',
  filterOperatorIs: 'è',
  filterOperatorNot: 'non è',
  filterOperatorAfter: 'dopo',
  filterOperatorOnOrAfter: 'il o dopo',
  filterOperatorBefore: 'prima',
  filterOperatorOnOrBefore: 'il o prima',
  filterOperatorIsEmpty: 'è vuoto',
  filterOperatorIsNotEmpty: 'non è vuoto',
  filterOperatorIsAnyOf: 'è uno di',
  filterValueAny: 'qualunque',
  filterValueTrue: 'vero',
  filterValueFalse: 'falso',
  columnMenuLabel: 'Menu',
  columnMenuShowColumns: 'Mostra colonne',
  columnMenuFilter: 'Filtra',
  columnMenuHideColumn: 'Nascondi',
  columnMenuUnsort: 'Rimuovi ordinamento',
  columnMenuSortAsc: 'Ordina in modo ascendente',
  columnMenuSortDesc: 'Ordina in modo discendente',
  footerRowSelected: (count) =>
    count !== 1
      ? `${count.toLocaleString()} righe selezionate`
      : `${count.toLocaleString()} riga selezionata`,
  footerTotalRows: 'Righe Totali:',
  footerTotalVisibleRows: (visibleCount, totalCount) =>
    `${visibleCount.toLocaleString()} di ${totalCount.toLocaleString()}`,
  checkboxSelectionHeaderName: 'Selezione checkbox',
  booleanCellTrueLabel: 'vero',
  booleanCellFalseLabel: 'falso',
  actionsCellMore: 'più',
  columnHeaderFiltersTooltipActive: (count) =>
    count !== 1 ? `${count} filtri attivi` : `${count} filtro attivo`,
  columnHeaderFiltersLabel: 'Mostra filtri',
  columnHeaderSortIconLabel: 'Ordina',
  paginationLabelDisplayedRows: ({ from, to, count }) =>
    `${from}–${to} di ${count !== -1 ? count : `più di ${to}`}`,
  paginationLabelRowsPerPage: 'Righe per pagina:',
  paginationLabelRowsPerPageTooltip: 'Righe per pagina',
  paginationShowFirstButtonTooltip: 'Mostra prima pagina',
  paginationShowLastButtonTooltip: 'Mostra ultima pagina',
  paginationShowNextButtonTooltip: 'Pagina successiva',
  paginationShowPreviousButtonTooltip: 'Pagina precedente',
  toolbarColumnsButton: 'Mostra/Nascondi colonne',
  toolbarShowHideAll: 'Mostra/Nascondi tutto',
};

const columns = [
  {
    field: 'timestamp',
    headerName: 'Data',
    width: 100,
    headerClassName: 'header-bold',
  },
  {
    field: 'id',
    headerName: 'Event ID',
    flex: 1,
    headerClassName: 'header-bold',
  },
  {
    field: 'author',
    headerName: 'Autore',
    flex: 1,
    headerClassName: 'header-bold',
    valueGetter: (value) => {
      if (value) {
        return `${value.name} ${value.surname}`;
      } else {
        return 'unknown';
      }
    },
  },
  {
    field: 'operationName',
    headerName: 'Operazione',
    flex: 1,
    headerClassName: 'header-bold',
  },
  {
    field: 'error',
    headerName: 'Errore',
    flex: 1,
    headerClassName: 'header-bold',
    renderCell: (params) => (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          height: '100%',
          marginLeft: '15px',
        }}
      >
        <span
          style={{
            display: 'inline-block',
            width: 10,
            height: 10,
            borderRadius: '50%',
            backgroundColor: params.value ? 'red' : 'green',
            marginRight: 8,
          }}
        />
        {params.value}
      </div>
    ),
  },
];

function ActivityList({
  data = [],
  fetchPaginationData,
  continueFetching,
  loadingItems,
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [page, setPage] = useState({ pageSize: 100, page: 0 });
  const [fetching, setFetching] = useState(0);
  const isSmallScreen = useMediaQuery('(max-width: 950px)');
  const [avatarUrl, setAvatarUrl] = useState('');
  const { role } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const handlePageChange = (event) => {
    if (event.page > page.page && event.page > fetching && continueFetching) {
      setFetching(event.page);
      fetchPaginationData();
      setPage(event);
    } else {
      if (event.page > fetching && !continueFetching) {
        return;
      }
      setPage(event);
    }
  };

  const handleRowClick = (params) => {
    getAvatarUrl(params.row?.author?.avatarURL);
    const date = new Date(params.row.timestamp);
    params.row.date = `${String(date.getDay()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()} 
    ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
    setSelectedReport(params.row);
    setDrawerOpen(true);
  };

  const getAvatarUrl = async (avatarURL) => {
    if (avatarURL) {
      let url = await getUrl({ path: avatarURL });
      url = url.url.toString();
      setAvatarUrl(url);
    } else {
      setAvatarUrl('');
    }
  };

  const handleCloseDrawer = () => {
    setAvatarUrl('');
    setDrawerOpen(false);
    setSelectedReport(null);
  };

  useEffect(() => {
    if (selectedReport) {
      getAvatarUrl();
    }
  }, [selectedReport]);

  return (
    <div className='datalist-container'>
      <DataGrid
        className='data-grid'
        rows={data ? data : []}
        columns={columns}
        pageSizeOptions={[100]}
        rowCount={data.length}
        paginationModel={page}
        onPaginationModelChange={handlePageChange}
        paginationMode='server'
        loading={loadingItems}
        localeText={localeText}
        disableColumnSelector={true}
        disableMultipleRowSelection={true}
        onRowClick={handleRowClick}
        getRowId={(row) => row.id}
      />
      <Drawer
        anchor={isSmallScreen ? 'bottom' : 'right'}
        open={drawerOpen}
        onClose={handleCloseDrawer}
        PaperProps={{
          style: {
            width: isSmallScreen ? '100%' : '50%',
            height: isSmallScreen ? '100%' : '100%',
          },
        }}
      >
        <div style={{ padding: 16, position: 'relative' }}>
          <IconButton
            onClick={handleCloseDrawer}
            style={{ position: 'absolute', top: 8, right: 8 }}
          >
            <CloseIcon />
          </IconButton>
          {selectedReport && (
            <>
              <Typography variant='h6'>Dettagli Log</Typography>
              <CardContent sx={{ paddingLeft: '16px' }}>
                <Stack
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                  }}
                >
                  <Grid
                    sx={{
                      boxSizing: 'border-box',
                      display: 'flex',
                      flexFlow: 'wrap',
                      width: '100%',
                      marginTop: '-8px',
                      marginBottom: '8px',
                    }}
                  >
                    <Grid item xs={6} className='griditemspace'>
                      <span className='spanstylegrid'>
                        <p className='pstylegrid'>Autore</p>
                        <a className='astylegrid'>
                          <div
                            className='avatarcontainergrid'
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                              if (selectedReport.author) {
                                if (role === 'admin') {
                                  navigate(
                                    `/admin/profile/${selectedReport.author.id}`
                                  );
                                } else
                                  [
                                    navigate(
                                      `/app/profile/${selectedReport.author.id}`
                                    ),
                                  ];
                              }
                            }}
                          >
                            <Avatar
                              sx={{ marginRight: '9px' }}
                              src={avatarUrl}
                            />
                            {selectedReport.author?.name}{' '}
                            {selectedReport.author?.surname}
                            {!selectedReport.author && 'Unknown'}
                          </div>
                        </a>
                      </span>
                    </Grid>
                    <Grid item xs={6} className='griditemspace'>
                      <span className='spanstylegrid'>
                        <p className='pstylegrid'>Operazione</p>
                        <a className='astylegrid'>
                          <div className='avatarcontainergrid'>
                            {selectedReport.operationName}
                          </div>
                        </a>
                      </span>
                    </Grid>
                    <Grid item xs={6} className='griditemspace'>
                      <span className='spanstylegrid'>
                        <p className='pstylegrid'>Data e Ora</p>
                        <a className='astylegrid'>
                          <div className='avatarcontainergrid'>
                            {selectedReport.date}
                          </div>
                        </a>
                      </span>
                    </Grid>
                    <Grid item xs={6} className='griditemspace'>
                      <span className='spanstylegrid'>
                        <p className='pstylegrid'>Error</p>
                        <a className='astylegrid'>
                          <div className='avatarcontainergrid'>
                            <span
                              style={{
                                display: 'inline-block',
                                width: 10,
                                height: 10,
                                borderRadius: '50%',
                                backgroundColor: selectedReport.error
                                  ? 'red'
                                  : 'green',
                                marginLeft: '10px',
                              }}
                            />
                          </div>
                        </a>
                      </span>
                    </Grid>
                  </Grid>
                  {selectedReport.error && (
                    <FormControl
                      className='reportcontainertext'
                      style={{
                        backgroundColor: '#ffb2b2',
                      }}
                    >
                      <span>
                        Error Info
                        <span
                          style={{
                            display: 'inline-block',
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            backgroundColor: selectedReport.error
                              ? 'red'
                              : 'green',
                            marginLeft: '10px',
                          }}
                        />
                      </span>
                      <div className='inputbasestyle'>
                        {selectedReport.errorMessage}
                      </div>
                    </FormControl>
                  )}
                  <FormControl className='reportcontainertext'>
                    <span>Messaggio</span>
                    <div className='inputbasestyle'>
                      {selectedReport.operationMessage}
                    </div>
                  </FormControl>
                  <FormControl className='reportcontainertext'>
                    <span>Risultato operazione</span>
                    <div className='inputbasestyle'>
                      <Typography paragraph>
                        {JSON.stringify(
                          JSON.parse(selectedReport.operationResult),
                          null,
                          2
                        )}
                      </Typography>
                    </div>
                  </FormControl>
                </Stack>
              </CardContent>
            </>
          )}
        </div>
      </Drawer>
    </div>
  );
}

ActivityList.propTypes = {
  data: PropTypes.array,
  fetchPaginationData: PropTypes.func,
  continueFetching: PropTypes.bool,
  loadingItems: PropTypes.bool,
};

export default ActivityList;
