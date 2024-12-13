import { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Avatar from '@mui/material/Avatar';
import {
  IconButton,
  Button,
  Drawer,
  Typography,
  Grid,
  CardContent,
  useMediaQuery,
  Stack,
  FormControl,
} from '@mui/material';
import EditReportDialog from '../../../components/common/EditReportDialog/EditReportDialog';
import CloseIcon from '@mui/icons-material/Close';
import { Visibility, Edit } from '@mui/icons-material';
import './ReportList.css';
import PropTypes from 'prop-types';
import { markReportAsSeen } from '../../../services/mutations';
import { generateClient } from 'aws-amplify/api';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getUrl } from 'aws-amplify/storage';
const appsync = generateClient();
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

function ReportList({
  data = [],
  fetchPaginationData,
  continueFetching,
  loadingItems,
  type,
  setData,
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [page, setPage] = useState({ pageSize: 100, page: 0 });
  const [fetching, setFetching] = useState(0);
  const isSmallScreen = useMediaQuery('(max-width: 950px)');
  const [openEditReport, setOpenEditReport] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState('');
  const navigate = useNavigate();
  const { role } = useSelector((state) => state.auth);

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
    setSelectedReport(params.row);
    getAvatarUrl(params.row.tutor?.avatarURL);
    setDrawerOpen(true);
  };
  const onClickEditReport = (params) => {
    setReportData(params.row);
    setOpenEditReport(true);
  };

  const handleCloseDrawer = () => {
    setAvatarUrl('');
    setDrawerOpen(false);
    setSelectedReport(null);
  };
  const handleConfirmRead = async (reportId, pazienteId) => {
    try {
      await appsync.graphql({
        query: markReportAsSeen,
        variables: {
          reportId,
          pazienteId,
        },
      });
      // Update local state to reflect changes if necessary
      setSelectedReport((prevReport) => ({
        ...prevReport,
        status: 'Visto',
      }));
      setData((prevData) =>
        prevData.map((item) =>
          item.reportId === selectedReport.reportId
            ? { ...item, status: 'Visto' }
            : item
        )
      );
    } catch (error) {
      console.error('Error marking report as seen:', error);
    }
  };
  const columns = [
    {
      field: 'data',
      headerName: 'Data',
      width: 100,
      headerClassName: 'header-bold',
    },
    {
      field: 'nome',
      headerName: 'Nome Tutor',
      flex: 1,
      headerClassName: 'header-bold',
    },
    {
      field: 'role',
      headerName: 'Ruolo',
      flex: 1,
      headerClassName: 'header-bold',
    },
    {
      field: 'paziente',
      headerName: 'Paziente',
      flex: 1,
      headerClassName: 'header-bold',
    },
    {
      field: 'description',
      headerName: 'Titolo Report',
      flex: 1,
      headerClassName: 'header-bold',
    },
    {
      field: 'status',
      headerName: 'Stato',
      flex: 1,
      headerClassName: 'header-bold',
      renderCell: (params) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span
            style={{
              display: 'inline-block',
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: params.value === 'Visto' ? 'green' : 'red',
              marginRight: 8,
            }}
          />
          {params.value}
        </div>
      ),
    },
    {
      field: 'edit',
      headerName: 'Azioni',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <>
          <IconButton onClick={() => handleRowClick(params)}>
            <Visibility />
          </IconButton>
          {type === 'mine' && params.row.myReport && (
            <IconButton onClick={() => onClickEditReport(params)}>
              <Edit />
            </IconButton>
          )}
        </>
      ),
    },
  ];

  const getAvatarUrl = async (avatarURL) => {
    if (avatarURL) {
      let url = await getUrl({ path: avatarURL });
      url = url.url.toString();
      setAvatarUrl(url);
    } else {
      setAvatarUrl('');
    }
  };

  useEffect(() => {
    if (!openEditReport && reportData) {
      setData((prevData) =>
        prevData.map((item) =>
          item.reportId === reportData.reportId ? reportData : item
        )
      );
    }
  }, [openEditReport]);

  return (
    <div className='datalist-container'>
      {/* <div className='search-input'>
       <InputBase
          className='search-input-field'
          multiline
          maxRows={3}
          inputProps={{ 'aria-label': 'comment' }}
          placeholder='Cerca un report...'
          value={inputValue}
          onChange={handleInputChange}
          endAdornment={
            <InputAdornment position='end'>
              <IconButton
                disabled={!isButtonEnabled}
                sx={{
                  color: isButtonEnabled ? 'black' : 'grey',
                }}
              >
                <SearchIcon />
              </IconButton>
            </InputAdornment>
          }
        />
      </div>*/}
      {openEditReport && (
        <EditReportDialog
          open={openEditReport}
          setOpen={setOpenEditReport}
          reportData={reportData}
          setReportData={setReportData}
        />
      )}
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
        getRowId={(row) => row.reportId}
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
              <Typography variant='h6'>Dettagli Report</Typography>
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
                        <p className='pstylegrid'>Operatore</p>
                        <a className='astylegrid'>
                          <div
                            className='avatarcontainergrid'
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                              if (selectedReport.tutor) {
                                if (role === 'admin') {
                                  navigate(
                                    `/admin/profile/${selectedReport.tutor.id}`
                                  );
                                } else
                                  [
                                    navigate(
                                      `/app/profile/${selectedReport.tutor.id}`
                                    ),
                                  ];
                              }
                            }}
                          >
                            <Avatar
                              sx={{ marginRight: '9px' }}
                              src={avatarUrl}
                            />
                            {selectedReport.nome}
                          </div>
                        </a>
                      </span>
                    </Grid>
                    <Grid item xs={6} className='griditemspace'>
                      <span className='spanstylegrid'>
                        <p className='pstylegrid'>Paziente</p>
                        <a className='astylegrid'>
                          <div className='avatarcontainergrid'>
                            {selectedReport.paziente}
                          </div>
                        </a>
                      </span>
                    </Grid>
                    <Grid item xs={6} className='griditemspace'>
                      <span className='spanstylegrid'>
                        <p className='pstylegrid'>Data Report</p>
                        <a className='astylegrid'>
                          <div className='avatarcontainergrid'>
                            {selectedReport.data}
                          </div>
                        </a>
                      </span>
                    </Grid>
                    <Grid item xs={6} className='griditemspace'>
                      <span className='spanstylegrid'>
                        <p className='pstylegrid'>Stato Report</p>
                        <a className='astylegrid'>
                          <div className='avatarcontainergrid'>
                            {selectedReport.status}
                            {selectedReport.status === 'Non Visto' && (
                              <Button
                                variant='contained'
                                sx={{ marginLeft: '10px' }}
                                onClick={() =>
                                  handleConfirmRead(
                                    selectedReport.reportId,
                                    selectedReport.pazienteId
                                  )
                                }
                              >
                                Conferma lettura
                              </Button>
                            )}
                          </div>
                        </a>
                      </span>
                    </Grid>
                  </Grid>
                  <FormControl className='reportcontainertext'>
                    <span>Contenuto Report</span>
                    <div className='inputbasestyle'>
                      {selectedReport.contenuto}
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

ReportList.propTypes = {
  data: PropTypes.array,
  fetchPaginationData: PropTypes.func,
  continueFetching: PropTypes.bool,
  loadingItems: PropTypes.bool,
  type: PropTypes.string,
  setData: PropTypes.func,
};

export default ReportList;
