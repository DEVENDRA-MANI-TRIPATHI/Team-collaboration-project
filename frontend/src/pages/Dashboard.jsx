import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import useAuth from '../hooks/useAuth';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Pagination from '@mui/material/Pagination';
import { Link } from 'react-router-dom';

import CreateTask from '../components/CreateTask.jsx';

export default function Dashboard() {
  const { user, accessToken } = useAuth();

 
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [openCreate, setOpenCreate] = useState(false);

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

  const fetchTasks = async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit };
      if (status) params.status = status;
      if (search.trim()) params.search = search.trim();

      const { data } = await axios.get(`${baseURL}/task`, {
        params,
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      setItems(data.items || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!accessToken) return;
    fetchTasks();
  }, [accessToken, status, page]);

  const { createdByMe, assignedToMe } = useMemo(() => {
    const meId = user?._id || user?.id;
    const created = [];
    const assigned = [];
    for (const t of items) {
      if (String(t.createdBy) === String(meId)) created.push(t);
      if (String(t.assignedTo) === String(meId)) assigned.push(t);
    }
    return { createdByMe: created, assignedToMe: assigned };
  }, [items, user]);

  const onApplySearch = () => {
    setPage(1);
    fetchTasks();
  };

  const onClearFilters = () => {
    setStatus('');
    setSearch('');
    setPage(1);
    setTimeout(fetchTasks, 0);
  };

  const onCreated = () => {
    fetchTasks();
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h5">My Tasks</Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }}>
        
        <TextField
          select
          size="small"
          label="Status"
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="pending">Pending</MenuItem>
          <MenuItem value="completed">Completed</MenuItem>
        </TextField>

        <Button variant="contained" onClick={onApplySearch}>Apply</Button>
        <Button variant="text" onClick={onClearFilters}>Clear</Button>

        <Box sx={{ flex: 1 }} />
        <Button variant="contained" onClick={() => setOpenCreate(true)}>
          Create Task
        </Button>
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'grid', placeItems: 'center', py: 6 }}>
          <CircularProgress size={28} />
        </Box>
      ) : (
        <>
          <Paper variant="outlined">
            <Box sx={{ p: 2 }}>
              <Typography variant="h6">Created by me</Typography>
            </Box>
            <Divider />
            {createdByMe.length === 0 ? (
              <Box sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary">No tasks created by you.</Typography>
              </Box>
            ) : (
              <List>
                {createdByMe.map((t) => (
                  <ListItemButton key={t._id} component={Link} to={`/tasks/${t._id}`}>
                    <ListItemText primary={t.title} secondary={t.description || undefined} />
                    <Chip
                      label={t.status}
                      color={t.status === 'completed' ? 'success' : 'default'}
                      size="small"
                    />
                  </ListItemButton>
                ))}
              </List>
            )}
          </Paper>

          <Paper variant="outlined">
            <Box sx={{ p: 2 }}>
              <Typography variant="h6">Assigned to me</Typography>
            </Box>
            <Divider />
            {assignedToMe.length === 0 ? (
              <Box sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary">No tasks assigned to you.</Typography>
              </Box>
            ) : (
              <List>
                {assignedToMe.map((t) => (
                  <ListItemButton key={t._id} component={Link} to={`/tasks/${t._id}`}>
                    <ListItemText primary={t.title} secondary={t.description || undefined} />
                    <Chip
                      label={t.status}
                      color={t.status === 'completed' ? 'success' : 'default'}
                      size="small"
                    />
                  </ListItemButton>
                ))}
              </List>
            )}
          </Paper>

          {pages > 1 && (
            <Stack direction="row" justifyContent="center">
              <Pagination count={pages} page={page} onChange={(_e, v) => setPage(v)} shape="rounded" />
            </Stack>
          )}
        </>
      )}

      <CreateTask
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onCreated={onCreated}
      />
    </Stack>
  );
}
