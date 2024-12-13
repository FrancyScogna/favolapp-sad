import {
  Typography,
  Switch,
  FormControlLabel,
  Button,
  CircularProgress,
} from '@mui/material';
import './Report.css';
import ReportList from './ReportList/ReportList';
import { generateClient } from 'aws-amplify/api';
import { useEffect, useState } from 'react';
import {
  getMyReport,
  getColleguesReports,
  getAllReports,
  getUser,
  getReportsByOtherUser,
} from '../../services/queries';
import { useDispatch, useSelector } from 'react-redux';
import { showSnackbar } from '../../slices/snackbar-slice';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import AddReportDialog from '../../components/common/AddReportDialog/AddReportDialog';
const appsync = generateClient();
import PropTypes from 'prop-types';
function Report({ type = 'mine' }) {
  const [showColleaguesReport, setShowColleaguesReport] = useState(false);
  const [reports, setReports] = useState([]);
  const [nextToken, setNextToken] = useState(null);
  const [continueFetching, setContinueFetching] = useState(true);
  const [switchLabel, setSwitchLabel] = useState('Mostra report dei colleghi');
  const { user, role } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [otherUser, setOtherUser] = useState(null);
  const { userId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [openCreateReport, setOpenCreateReport] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  const transformData = (items) => {
    return items.map((item) => ({
      tutor: item.tutor,
      reportId: item.reportId,
      data: new Date(item.createdAt).toLocaleDateString(),
      tutorID: item.tutor.id,
      nome: `${item.tutor.name} ${item.tutor.surname}`,
      role: item.tutor.role,
      paziente: `${item.paziente.name} ${item.paziente.surname}`,
      pazienteName: item.paziente.name,
      pazienteSurname: item.paziente.surname,
      pazienteCodFis: item.paziente.codfis,
      pazienteId: item.pazienteId,
      description: item.description,
      status:
        item.seenBy && item.seenBy.includes(user.id) ? 'Visto' : 'Non Visto',
      contenuto: item.contenuto,
      myReport: item.tutor.id === user.id,
    }));
  };

  const fetchOtherUser = async () => {
    try {
      const data = await appsync.graphql({
        query: getUser,
        variables: { userId },
      });
      let otherUser = data.data.getUser;
      setOtherUser(otherUser);
      setLoading(false);
    } catch (error) {
      dispatch(
        showSnackbar({
          message: 'Si è verificato un errore',
          severity: 'error',
        })
      );
      if (role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/app/dashboard', { replace: true });
      }
    }
  };

  const fetchMyReport = async () => {
    setLoadingData(true);
    try {
      const data = await appsync.graphql({
        query: getMyReport,
        variables: {
          limit: 101,
          nextToken: nextToken ? nextToken : null,
        },
      });
      const items = data.data.getMyReport.items;
      if (items && items.length > 0) {
        setReports((prev) => [...prev, ...transformData(items)]);
      }
      if (data.data.getMyReport.nextToken) {
        setNextToken(data.data.getMyReport.nextToken);
      } else {
        setNextToken(null);
        setContinueFetching(false);
      }
      setLoadingData(false);
    } catch (error) {
      dispatch(
        showSnackbar({
          message:
            'Si è verificato un errore con il Database, ricarica la pagina.',
          severity: 'error',
        })
      );
      setLoadingData(false);
    }
  };

  const fetchOtherUserReports = async () => {
    setLoadingData(true);
    try {
      const data = await appsync.graphql({
        query: getReportsByOtherUser,
        variables: {
          otherUserId: userId,
          limit: 101,
          nextToken: nextToken ? nextToken : null,
        },
      });
      const items = data.data.getReportsByOtherUser.items;
      if (items && items.length > 0) {
        setReports((prev) => [...prev, ...transformData(items)]);
      }
      if (data.data.getReportsByOtherUser.nextToken) {
        setNextToken(data.data.getReportsByOtherUser.nextToken);
      } else {
        setNextToken(null);
        setContinueFetching(false);
      }
      setLoadingData(false);
    } catch (error) {
      dispatch(
        showSnackbar({
          message:
            'Si è verificato un errore con il Database, ricarica la pagina.',
          severity: 'error',
        })
      );
      setLoadingData(false);
    }
  };

  const fetchColleaguesReports = async () => {
    setLoadingData(true);
    try {
      const data = await appsync.graphql({
        query: getColleguesReports,
        variables: {
          limit: 101,
          nextToken: nextToken ? nextToken : null,
        },
      });
      const items = data?.data?.getColleguesReports?.items;
      if (items && items.length > 0) {
        setReports((prev) => [...prev, ...transformData(items)]);
      }
      if (data.data.getColleguesReports.nextToken) {
        setNextToken(data.data.getColleguesReports.nextToken);
      } else {
        setNextToken(null);
        setContinueFetching(false);
      }
      setLoadingData(false);
    } catch (error) {
      dispatch(
        showSnackbar({
          message:
            'Si è verificato un errore con il Database, ricarica la pagina.',
          severity: 'error',
        })
      );
      setLoadingData(false);
    }
  };

  const fetchAllReport = async () => {
    setLoadingData(true);
    try {
      const data = await appsync.graphql({
        query: getAllReports,
        variables: {
          limit: 101,
          nextToken: nextToken ? nextToken : null,
        },
      });
      const items = data.data.getAllReports.items;
      if (items && items.length > 0) {
        setReports((prev) => [...prev, ...transformData(items)]);
      }
      if (data.data.getAllReports.nextToken) {
        setNextToken(data.data.getAllReports.nextToken);
      } else {
        setNextToken(null);
        setContinueFetching(false);
      }
      setLoadingData(false);
    } catch (error) {
      dispatch(
        showSnackbar({
          message:
            'Si è verificato un errore con il Database, ricarica la pagina.',
          severity: 'error',
        })
      );
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (!loading) {
      if (showColleaguesReport) {
        fetchColleaguesReports();
        setSwitchLabel('Mostra i miei report');
      } else if (type !== 'mine') {
        fetchOtherUserReports();
      } else if (type === 'mine') {
        fetchMyReport();
        setSwitchLabel('Mostra i report dei colleghi');
      }
    }
  }, [showColleaguesReport, loading]);

  useEffect(() => {
    setLoading(true);
    setReports([]);
    setNextToken(null);
    if (type !== 'mine') {
      if (userId === user.id) {
        if (role === 'admin') {
          navigate('/admin/reportlist', { replace: true });
        } else {
          navigate('/app/reportlist', { replace: true });
        }
      } else {
        fetchOtherUser();
      }
    } else {
      setLoading(false);
    }
  }, [location.pathname]);

  const handleAdminButtonClick = () => {
    setReports([]);
    setNextToken(null);
    setContinueFetching(true);
    fetchAllReport();
  };

  if (loading) {
    return (
      <div className='pazienti-loading-page'>
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className='report-page'>
      <div className='title-container'>
        <Typography className='title'>
          {type === 'mine'
            ? 'Report'
            : `I report di ${otherUser ? otherUser.name : '...'}`}
        </Typography>
        {type === 'mine' && (
          <Button
            className='add-report-button'
            variant='contained'
            onClick={() => setOpenCreateReport(true)}
          >
            Crea Report
          </Button>
        )}
      </div>
      {type === 'mine' && (
        <div className='switch-container'>
          <FormControlLabel
            sx={{ color: 'black', marginLeft: '10px' }}
            control={
              <Switch
                checked={showColleaguesReport}
                onChange={(e) => {
                  setShowColleaguesReport(e.target.checked);
                  setReports([]);
                  setNextToken(null);
                  setContinueFetching(true);
                }}
              />
            }
            label={switchLabel}
          />
          {role === 'admin' && (
            <Button
              variant='contained'
              color='primary'
              onClick={handleAdminButtonClick}
              style={{ marginLeft: '10px' }}
            >
              Tutti i report
            </Button>
          )}
        </div>
      )}
      <div className='reportlist-container'>
        <ReportList
          data={reports}
          fetchPaginationData={
            showColleaguesReport
              ? fetchColleaguesReports
              : type !== 'mine' && otherUser
                ? fetchOtherUserReports
                : fetchMyReport
          }
          setData={setReports}
          continueFetching={continueFetching}
          loadingItems={loadingData}
          type={type}
        />
      </div>
      {openCreateReport && (
        <AddReportDialog
          open={openCreateReport}
          setOpen={setOpenCreateReport}
        />
      )}
    </div>
  );
}

Report.propTypes = {
  type: PropTypes.string,
};

export default Report;
