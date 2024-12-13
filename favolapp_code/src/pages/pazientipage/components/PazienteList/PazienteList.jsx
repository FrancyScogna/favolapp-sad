import { useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { IconButton } from '@mui/material';
import './PazienteList.css';
import { Visibility } from '@mui/icons-material';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

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

function PazienteList({
  data = [],
  fetchPaginationData,
  continueFetching,
  loadingItems,
}) {
  const [page, setPage] = useState({ pageSize: 100, page: 0 });
  const [fetching, setFetching] = useState(0);
  const navigate = useNavigate();
  const { role } = useSelector((state) => state.auth);

  const onClickViewPaziente = (pazienteId) => {
    if (role === 'admin') {
      navigate(`/admin/paziente/${pazienteId}`);
    } else {
      navigate(`/app/paziente/${pazienteId}`);
    }
  };

  const columns = [
    { field: 'name', headerName: 'Nome', flex: 1 },
    { field: 'surname', headerName: 'Cognome', flex: 1 },
    {
      field: 'createdAt',
      headerName: 'Data inserimento',
      width: 180,
      valueGetter: (params) => {
        const date = new Date(params);
        const day = date.getUTCDate();
        const month = date.getUTCMonth() + 1;
        const year = date.getUTCFullYear();
        const formattedDay = String(day).padStart(2, '0');
        const formattedMonth = String(month).padStart(2, '0');
        const formattedDate = `${formattedDay}/${formattedMonth}/${year}`;
        return formattedDate;
      },
    },
    {
      field: 'treatment',
      headerName: 'Area di trattamento',
      minWidth: 160,
      flex: 1,
    },
    { field: 'sessionsCount', headerName: 'Sessioni', flex: 1 },
    {
      field: 'edit',
      headerName: 'Azioni',
      width: 150,
      sortable: false,
      renderCell: (data) => (
        <>
          <IconButton onClick={() => onClickViewPaziente(data.row.id)}>
            <Visibility />
          </IconButton>
        </>
      ),
    },
  ];

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
      />
    </div>
  );
}

PazienteList.propTypes = {
  data: PropTypes.array,
  fetchPaginationData: PropTypes.func,
  continueFetching: PropTypes.bool,
  loadingItems: PropTypes.bool,
};

export default PazienteList;
