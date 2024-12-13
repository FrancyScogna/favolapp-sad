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
  Button,
  FormControl,
} from '@mui/material';
import EditNoteIcon from '@mui/icons-material/EditNote';
import CloseIcon from '@mui/icons-material/Close';
import AddTaskDialog from './components/AddTaskDialog/AddTaskDialog';
import './TaskPage.css';

const localeText = {
  // Customizing the DataGrid text in Italian
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
  // Pagination
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
    field: 'data',
    headerName: 'Data',
    width: 150,
    headerClassName: 'header-bold',
  },
  {
    field: 'nome',
    headerName: 'Nome',
    flex: 1,
    headerClassName: 'header-bold',
  },
  {
    field: 'cognome',
    headerName: 'Cognome',
    flex: 1,
    headerClassName: 'header-bold',
  },
  {
    field: 'role',
    headerName: 'Ruolo',
    width: 150,
    headerClassName: 'header-bold',
  },
  {
    field: 'paziente',
    headerName: 'Paziente',
    flex: 1,
    headerClassName: 'header-bold',
  },
  {
    field: 'task',
    headerName: 'Task',
    flex: 1,
    headerClassName: 'header-bold',
  },
  {
    field: 'status',
    headerName: 'Stato',
    width: 150,
    headerClassName: 'header-bold',
    renderCell: (params) => (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span
          style={{
            display: 'inline-block',
            width: 10,
            height: 10,
            borderRadius: '50%',
            backgroundColor: params.value === 'Completato' ? 'green' : 'red',
            marginRight: 8,
          }}
        />
        {params.value}
      </div>
    ),
  },
];

const generateRows = () => {
  const roles = ['Tutor', 'Supervisore', 'Pedagogista', 'RBT', 'Logopedista'];
  const randomRole = () => roles[Math.floor(Math.random() * roles.length)];
  const names = ['Mario', 'Luca', 'Giulia', 'Anna'];
  const surnames = ['Rossi', 'Bianchi', 'Verdi', 'Neri'];
  const statuses = ['Completato', 'Non Completato'];
  const patients = ['Paziente 1', 'Paziente 2', 'Paziente 3', 'Paziente 4'];
  const task = ['Task 1', 'Task  2', 'Task 3', 'Task 4'];

  return Array.from({ length: 16 }, (_, index) => ({
    id: index + 1,
    data: new Date().toLocaleDateString('it-IT'),
    nome: names[index % names.length],
    cognome: surnames[index % surnames.length],
    role: randomRole(),
    paziente: patients[index % patients.length],
    task: task[index % task.length],
    status: statuses[index % statuses.length],
  }));
};

function TaskList() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [rows, setRows] = useState([]);
  const isSmallScreen = useMediaQuery('(max-width: 950px)');

  useEffect(() => {
    const rowsData = generateRows();
    setRows(rowsData);
  }, []);

  const handleRowClick = (params) => {
    setSelectedUser(params.row);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedUser(null);
  };
  const handleButtonClick = () => {
    setIsDialogOpen(true);
  };
  return (
    <div className='datalist-container'>
      <div className='search-input'>
        <Button
          variant='contained'
          color='primary'
          endIcon={<EditNoteIcon />}
          style={{ marginLeft: '-1px' }}
          onClick={handleButtonClick}
        >
          Crea Task
        </Button>
      </div>
      {rows.length > 0 ? (
        <DataGrid
          className='data-grid'
          rows={rows}
          columns={columns}
          pageSize={4}
          rowsPerPageOptions={[4]}
          disableColumnResize={false}
          localeText={localeText}
          onRowClick={handleRowClick}
        />
      ) : (
        <p>Caricamento dati...</p>
      )}
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
          {selectedUser && (
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
                        <p className='pstylegrid'>Operatore/i</p>
                        <a className='astylegrid'>
                          <div className='avatarcontainergrid'>
                            <Avatar
                              src={selectedUser.avatar}
                              sx={{ marginRight: '9px' }}
                            />
                            {selectedUser.nome}
                          </div>
                        </a>
                      </span>
                    </Grid>
                    <Grid item xs={6} className='griditemspace'>
                      <span className='spanstylegrid'>
                        <p className='pstylegrid'>Paziente</p>
                        <a className='astylegrid'>
                          <div className='avatarcontainergrid'>
                            {selectedUser.paziente}
                          </div>
                        </a>
                      </span>
                    </Grid>
                    <Grid item xs={6} className='griditemspace'>
                      <span className='spanstylegrid'>
                        <p className='pstylegrid'>Data Task</p>
                        <a className='astylegrid'>
                          <div className='avatarcontainergrid'>
                            {selectedUser.data}
                          </div>
                        </a>
                      </span>
                    </Grid>
                    <Grid item xs={6} className='griditemspace'>
                      <span className='spanstylegrid'>
                        <p className='pstylegrid'>Stato Task</p>
                        <a className='astylegrid'>
                          <div className='avatarcontainergrid'>
                            {selectedUser.status}
                          </div>
                        </a>
                      </span>
                    </Grid>
                  </Grid>
                  <FormControl className='reportcontainertext'>
                    <span>Contenuto Task</span>
                    <div className='inputbasestyle'>
                      Numquam molestiae rerum dolores eius quia repellendus.
                      Cumque quis maiores voluptate accusamus natus sunt. Eos
                      dolores et non nostrum et dolorem velit a. Et quis amet
                      enim ut consequatur sunt ad. Sed eos accusantium
                      repellendus consequatur reprehenderit quos quasi
                      consequatur nobis. Non rerum error voluptas temporibus
                      natus itaque. Omnis sed facere qui sint commodi a quis.
                      Voluptatum molestiae sint veniam voluptates eligendi vitae
                      quisquam voluptas ipsam. Sed voluptas ad dolorem incidunt
                      sint quaerat. Suscipit distinctio quisquam et rerum. Ut
                      quia quo soluta rerum recusandae molestiae possimus
                      voluptates tenetur. Natus error sed earum. Possimus quia
                      accusamus est perferendis. Est quibusdam quo sint numquam
                      ut rerum. Recusandae omnis et ut nostrum et est quam. Iure
                      dolorem autem dolores minima animi. Dolorem dignissimos
                      ratione molestias beatae hic commodi rerum maiores.
                      Officia unde libero ad alias in praesentium.
                    </div>
                  </FormControl>
                </Stack>
              </CardContent>
            </>
          )}
        </div>
      </Drawer>
      <AddTaskDialog open={isDialogOpen} setOpen={setIsDialogOpen} />
    </div>
  );
}

export default TaskList;
