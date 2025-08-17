import { useEffect, useMemo, useState } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuth from '../hooks/useAuth';

import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Pagination from '@mui/material/Pagination';
import Link from '@mui/material/Link';
import StackActions from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { accessToken, user } = useAuth();
  const baseURL = import.meta.env.VITE_API_URL;

  // Task state
  const [task, setTask] = useState(null);
  const [loadingTask, setLoadingTask] = useState(true);
  const [taskError, setTaskError] = useState('');

  // Comments state
  const [comments, setComments] = useState([]);
  const [cTotal, setCTotal] = useState(0);
  const [cPages, setCPages] = useState(1);
  const [cPage, setCPage] = useState(1);
  const [cLimit] = useState(10);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentsError, setCommentsError] = useState('');

  // New comment
  const [text, setText] = useState('');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');

  // Delete confirm dialog
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const meId = String(user?._id || user?.id || '');
  const canToggleStatus = useMemo(() => {
    if (!task || !user) return false;
    return (
      user.role === 'admin' ||
      String(task.createdBy?._id || task.createdBy) === meId ||
      String(task.assignedTo?._id || task.assignedTo) === meId
    );
  }, [task, user, meId]);

  const canDelete = useMemo(() => {
    if (!task || !user) return false;
    return (
      user.role === 'admin' ||
      String(task.createdBy?._id || task.createdBy) === meId
    );
  }, [task, user, meId]);

  // Helper: friendly display for users
  const displayUser = (u) => {
    if (!u) return 'Unknown';
    if (typeof u === 'string') return u; // fallback if not populated
    const name = u.username || u.name || '';
    const email = u.email || '';
    if (name && email) return `${name} (${email})`;
    return name || email || 'Unknown';
  };

  // Fetch task (prefer backend to populate createdBy and assignedTo)
  const fetchTask = async () => {
    setLoadingTask(true);
    setTaskError('');
    try {
      const { data } = await axios.get(`${baseURL}/task/${id}`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setTask(data);
    } catch (err) {
      setTaskError(err?.response?.data?.message || 'Failed to load task');
    } finally {
      setLoadingTask(false);
    }
  };

  // Fetch comments
  const fetchComments = async () => {
    setLoadingComments(true);
    setCommentsError('');
    try {
      const { data } = await axios.get(`${baseURL}/task/${id}/comments`, {
        params: { page: cPage, limit: cLimit },
        withCredentials: true,
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setComments(data.items || []);
      setCTotal(data.total || 0);
      setCPages(data.pages || 1);
    } catch (err) {
      setCommentsError(err?.response?.data?.message || 'Failed to load comments');
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    if (!accessToken) return;
    fetchTask();
  }, [accessToken, id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!accessToken) return;
    fetchComments();
  }, [accessToken, id, cPage]); // eslint-disable-line react-hooks/exhaustive-deps

  const onAddComment = async (e) => {
    e.preventDefault();
    setAddError('');
    if (!text.trim()) {
      setAddError('Comment cannot be empty');
      return;
    }
    try {
      setAdding(true);
      await axios.post(
        `${baseURL}/task/${id}/comments`,
        { text: text.trim() },
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      setText('');
      setCPage(1);
      fetchComments();
    } catch (err) {
      setAddError(err?.response?.data?.message || 'Failed to add comment');
    } finally {
      setAdding(false);
    }
  };

  const toggleStatus = async () => {
    if (!task) return;
    const next = task.status === 'pending' ? 'completed' : 'pending';
    try {
      const { data } = await axios.put(
        `${baseURL}/task/${id}`,
        { status: next },
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      setTask(data);
    } catch (err) {
      setTaskError(err?.response?.data?.message || 'Failed to update status');
    }
  };

  const onConfirmDelete = async () => {
    setDeleting(true);
    try {
      await axios.delete(`${baseURL}/task/${id}`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setConfirmOpen(false);
      navigate('/');
    } catch (err) {
      setTaskError(err?.response?.data?.message || 'Failed to delete task');
    } finally {
      setDeleting(false);
    }
  };

  if (loadingTask) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', py: 6 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }
  if (taskError) {
    return <Alert severity="error">{taskError}</Alert>;
  }
  if (!task) {
    return <Alert severity="warning">Task not found.</Alert>;
  }

  return (
    <Stack spacing={2}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography variant="h5" sx={{ flex: 1 }}>{task.title}</Typography>
        <Chip
          label={task.status}
          color={task.status === 'completed' ? 'success' : 'default'}
          size="small"
        />
        {canToggleStatus && (
          <Button variant="outlined" size="small" onClick={toggleStatus}>
            Mark {task.status === 'pending' ? 'Completed' : 'Pending'}
          </Button>
        )}
        {canDelete && (
          <Button color="error" variant="outlined" size="small" onClick={() => setConfirmOpen(true)}>
            Delete
          </Button>
        )}
      </Stack>

      {/* Meta */}
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack spacing={1}>
          <Typography variant="body1">{task.description || 'No description.'}</Typography>
          <Typography variant="body2" color="text.secondary">
            Created: {new Date(task.createdAt || task.updatedAt || Date.now()).toLocaleString()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Assigned to: {displayUser(task.assignedTo)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Created by: {displayUser(task.createdBy)}
          </Typography>
          <Typography variant="body2">
            <Link component={RouterLink} to="/">Back to Dashboard</Link>
          </Typography>
        </Stack>
      </Paper>

      <Paper variant="outlined">
        <Box sx={{ p: 2 }}>
          <Typography variant="h6">Comments</Typography>
        </Box>
        <Divider />

        {commentsError ? (
          <Box sx={{ p: 2 }}>
            <Alert severity="error">{commentsError}</Alert>
          </Box>
        ) : loadingComments ? (
          <Box sx={{ display: 'grid', placeItems: 'center', py: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : comments.length === 0 ? (
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">No comments yet.</Typography>
          </Box>
        ) : (
          <List>
            {comments.map((c) => (
              <ListItem key={c._id} alignItems="flex-start">
                <ListItemText
                  primary={c.text}
                  secondary={new Date(c.createdAt || Date.now()).toLocaleString()}
                />
              </ListItem>
            ))}
          </List>
        )}

        {cPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <Pagination
              count={cPages}
              page={cPage}
              onChange={(_e, v) => setCPage(v)}
              shape="rounded"
            />
          </Box>
        )}

        <Divider />
        <Box component="form" onSubmit={onAddComment} sx={{ p: 2 }}>
          {addError && <Alert severity="error" sx={{ mb: 1 }}>{addError}</Alert>}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <TextField
              size="small"
              fullWidth
              placeholder="Write a comment..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <Button type="submit" variant="contained" disabled={adding}>
              {adding ? 'Posting...' : 'Post'}
            </Button>
          </Stack>
        </Box>
      </Paper>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Delete this task?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} disabled={deleting}>Cancel</Button>
          <Button onClick={onConfirmDelete} color="error" variant="contained" disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
